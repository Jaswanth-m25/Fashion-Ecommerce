const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Users = require('../models/User');
const Products = require('../models/Product');
const Orders = require('../models/Order');
const ActivityLog = require('../models/Activity');
const VendorPerformance = require('../models/VendorPerformance');
const UserAnalytics = require('../models/UserAnalytics');
const fetchUser = require('../middleware/fetchUser');
const isAdmin = require('../middleware/isAdmin');

// Get all users
router.get('/allusers', fetchUser, isAdmin, async (req, res) => {
    let users = await Users.find({});
    res.json(users);
});

// Delete user
router.post('/deleteuser', fetchUser, isAdmin, async (req, res) => {
    await Users.findOneAndDelete({ _id: req.body.userId });

    const activityLog = new ActivityLog({
        action: 'User deleted',
        type: 'user',
        userId: 'admin',
        userName: 'Admin',
        details: { deletedUserId: req.body.userId }
    });
    await activityLog.save();

    res.json({ success: true, message: "User deleted" });
});

// Update user role
router.post('/updaterole', fetchUser, isAdmin, async (req, res) => {
    await Users.findOneAndUpdate({ _id: req.body.userId }, { role: req.body.role });

    const activityLog = new ActivityLog({
        action: `User role changed to ${req.body.role}`,
        type: 'user',
        userId: 'admin',
        userName: 'Admin',
        details: { userId: req.body.userId, newRole: req.body.role }
    });
    await activityLog.save();

    res.json({ success: true, message: "User role updated" });
});

// Get all products
router.get('/allproducts', fetchUser, isAdmin, async (req, res) => {
    let products = await Products.find({});
    res.send(products);
});

// Get approved products (excluding removed ones)
router.get('/approvedproducts', fetchUser, isAdmin, async (req, res) => {
    let products = await Products.find({ approved: true, removedByAdmin: { $ne: true } });
    res.send(products);
});

// Get pending products
router.get('/pendingproducts', fetchUser, isAdmin, async (req, res) => {
    let products = await Products.find({ approved: false, removedByAdmin: { $ne: true }, rejectedByAdmin: { $ne: true } });
    res.send(products);
});

// Approve product
router.post('/approveproduct', fetchUser, isAdmin, async (req, res) => {
    const product = await Products.findOneAndUpdate(
        { id: req.body.id },
        { approved: true }
    );

    if (product && product.vendorId !== 'admin') {
        await VendorPerformance.findOneAndUpdate(
            { vendorId: product.vendorId },
            { $inc: { approvedProducts: 1 } }
        );
    }

    const activityLog = new ActivityLog({
        action: 'Product approved',
        type: 'product',
        userId: 'admin',
        userName: 'Admin',
        details: { productName: product.name, productId: req.body.id, vendorName: product.vendorName }
    });
    await activityLog.save();

    res.json({ success: true, message: "Product approved" });
});

// Reject product
router.post('/rejectproduct', fetchUser, isAdmin, async (req, res) => {
    try {
        const product = await Products.findOne({ id: req.body.id });
        await Products.findOneAndUpdate(
            { id: req.body.id },
            { 
                rejectedByAdmin: true, 
                rejectedAt: new Date(),
                rejectionReason: req.body.reason || 'Product does not meet guidelines'
            },
            { new: true }
        );

        const activityLog = new ActivityLog({
            action: 'Product rejected',
            type: 'product',
            userId: 'admin',
            userName: 'Admin',
            details: { productName: product?.name, productId: req.body.id, reason: req.body.reason }
        });
        await activityLog.save();

        res.json({ success: true, message: "Product rejected" });
    } catch (err) {
        res.json({ success: false, message: "Failed to reject product" });
    }
});

// Remove product
router.post('/removeproduct', fetchUser, isAdmin, async (req, res) => {
    try {
        await Products.findOneAndUpdate(
            { id: req.body.id },
            { removedByAdmin: true, removedAt: new Date() },
            { new: true }
        );
        res.json({ success: true, message: "Product removed" });
    } catch (err) {
        res.json({ success: false, message: "Failed to remove product" });
    }
});

// Update product vendor
router.post('/updateproductvendor', fetchUser, isAdmin, async (req, res) => {
    try {
        const { productId, vendorId, vendorName } = req.body;
        await Products.findOneAndUpdate({ id: productId }, { vendorId, vendorName });
        res.json({ success: true, message: "Vendor updated" });
    } catch (err) {
        res.json({ success: false, message: "Failed to update vendor" });
    }
});

// Get all orders
router.get('/orders', fetchUser, isAdmin, async (req, res) => {
    let orders = await Orders.find({});
    res.json(orders);
});

// ========== ANALYTICS ROUTES ==========

// Dashboard Analytics
router.get('/analytics/dashboard', fetchUser, isAdmin, async (req, res) => {
    try {
        // Total Revenue (excluding cancelled orders)
        const revenueResult = await Orders.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Total Orders (excluding cancelled)
        const totalOrders = await Orders.countDocuments({ status: { $ne: 'Cancelled' } });

        // Orders by status
        const ordersByStatus = await Orders.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Total Users by role
        const usersByRole = await Users.aggregate([
            { $group: { _id: { $ifNull: ['$role', 'customer'] }, count: { $sum: 1 } } }
        ]);

        // Total Products
        const totalProducts = await Products.countDocuments({ removedByAdmin: { $ne: true }, rejectedByAdmin: { $ne: true } });
        const approvedProducts = await Products.countDocuments({ approved: true, removedByAdmin: { $ne: true }, rejectedByAdmin: { $ne: true } });
        const pendingProducts = await Products.countDocuments({ approved: false, removedByAdmin: { $ne: true }, rejectedByAdmin: { $ne: true } });

        // Monthly Revenue (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Orders.aggregate([
            { $match: { status: { $ne: 'Cancelled' }, date: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $month: '$date' },
                    month: { $first: '$date' },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top selling products
        const topProducts = await Orders.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.id',
                    name: { $first: '$products.name' },
                    totalSold: { $sum: '$products.quantity' },
                    revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                revenue: { total: totalRevenue },
                orders: { total: totalOrders, byStatus: ordersByStatus },
                users: { total: usersByRole.reduce((sum, u) => sum + u.count, 0), byRole: usersByRole },
                products: { total: totalProducts, approved: approvedProducts, pending: pendingProducts },
                monthlyRevenue,
                topProducts
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Recent Activities
router.get('/analytics/activities', fetchUser, isAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const activities = await ActivityLog.find()
            .sort({ date: -1 })
            .limit(limit);

        res.json({ success: true, data: activities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Vendor Performance Analytics
router.get('/analytics/vendors', fetchUser, isAdmin, async (req, res) => {
    try {
        const vendors = await VendorPerformance.find().sort({ totalRevenue: -1 });

        const vendorDetails = await Promise.all(vendors.map(async (vendor) => {
            const userInfo = await Users.findById(vendor.vendorId);
            return {
                ...vendor.toObject(),
                email: userInfo?.email,
                joinDate: userInfo?.date
            };
        }));

        res.json({ success: true, data: vendorDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// User Analytics
router.get('/analytics/users', fetchUser, isAdmin, async (req, res) => {
    try {
        const userAnalytics = await UserAnalytics.aggregate([
            {
                $lookup: {
                    from: 'logindatas',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userId: 1,
                    userName: { $ifNull: ['$userInfo.name', 'Unknown'] },
                    userEmail: { $ifNull: ['$userInfo.email', 'Unknown'] },
                    userRole: { $ifNull: ['$userInfo.role', 'customer'] },
                    totalOrders: 1,
                    totalSpent: 1,
                    wishlistCount: 1,
                    lastActive: 1
                }
            },
            { $sort: { totalSpent: -1 } }
        ]);

        res.json({ success: true, data: userAnalytics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Wishlist Analytics
router.get('/analytics/wishlist', fetchUser, isAdmin, async (req, res) => {
    try {
        const allUsers = await Users.find({});
        const wishlistCounts = {};

        allUsers.forEach(user => {
            if (user.wishlistData && user.wishlistData.length > 0) {
                user.wishlistData.forEach(productId => {
                    wishlistCounts[productId] = (wishlistCounts[productId] || 0) + 1;
                });
            }
        });

        const productIds = Object.keys(wishlistCounts);
        const productsData = await Products.find({ id: { $in: productIds.map(id => parseInt(id)) } });

const wishlistAnalytics = productsData.map(product => ({
    productId: product.id,

    name: product.name,

    image:
        product.image ||
        product.images?.[0] ||
        '',

    category: product.category,

    price: product.price,

    new_price:
        product.new_price ||
        product.price,

    wishlistCount:
        wishlistCounts[
            product.id.toString()
        ] || 0
})).sort((a, b) => b.wishlistCount - a.wishlistCount).slice(0, 20);

        res.json({ success: true, data: wishlistAnalytics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Recent Orders with Details
router.get('/analytics/recent-orders', fetchUser, isAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const recentOrders = await Orders.find({})
            .sort({ date: -1 })
            .limit(limit);

        const enrichedOrders = await Promise.all(recentOrders.map(async (order) => {
            const userDetails = await Users.findById(order.userId);
            return {
                ...order.toObject(),
                customerDetails: userDetails ? {
                    name: userDetails.name,
                    email: userDetails.email,
                    role: userDetails.role
                } : null
            };
        }));

        res.json({ success: true, data: enrichedOrders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Category-wise Sales Analytics
router.get('/analytics/categories', fetchUser, isAdmin, async (req, res) => {
    try {
        const categorySales = await Orders.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $unwind: '$products' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.id',
                    foreignField: 'id',
                    as: 'productInfo'
                }
            },
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ['$productInfo.category', 'unknown'] },
                    totalSold: { $sum: '$products.quantity' },
                    revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        res.json({ success: true, data: categorySales });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Sales Summary (Daily/Weekly/Monthly)
router.get('/analytics/sales-summary', fetchUser, isAdmin, async (req, res) => {
    try {
        const period = req.query.period || 'daily';

        let groupBy;
        if (period === 'daily') {
            groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
        } else if (period === 'weekly') {
            groupBy = { $week: '$date' };
        } else {
            groupBy = { $dateToString: { format: '%Y-%m', date: '$date' } };
        }

        const salesSummary = await Orders.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: groupBy,
                    period: { $first: '$date' },
                    ordersCount: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    averageOrderValue: { $avg: '$totalAmount' }
                }
            },
            { $sort: { '_id': 1 } },
            { $limit: 30 }
        ]);

        res.json({ success: true, data: salesSummary, period });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Low Stock Products Alert
router.get('/analytics/low-stock', fetchUser, isAdmin, async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 10;
        const lowStockProducts = await Products.find({
            stock: { $lt: threshold, $exists: true },
            approved: true
        }).sort({ stock: 1 });

        res.json({ success: true, data: lowStockProducts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// User Growth Over Time
router.get('/analytics/user-growth', fetchUser, isAdmin, async (req, res) => {
    try {
        const period = req.query.period || 'monthly';

        let groupBy;
        if (period === 'daily') {
            groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
        } else if (period === 'monthly') {
            groupBy = { $dateToString: { format: '%Y-%m', date: '$date' } };
        } else {
            groupBy = { $year: '$date' };
        }

        const userGrowth = await Users.aggregate([
            {
                $group: {
                    _id: groupBy,
                    period: { $first: '$date' },
                    newUsers: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        let cumulative = 0;
        const growthWithCumulative = userGrowth.map(item => {
            cumulative += item.newUsers;
            return {
                ...item,
                totalUsers: cumulative
            };
        });

        res.json({ success: true, data: growthWithCumulative, period });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Dashboard Summary (Quick Stats)
router.get('/analytics/summary', fetchUser, isAdmin, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Today's stats
        const todayOrders = await Orders.countDocuments({
            date: { $gte: today },
            status: { $ne: 'Cancelled' }
        });

        const todayRevenue = await Orders.aggregate([
            { $match: { date: { $gte: today }, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // Week's stats
        const weekOrders = await Orders.countDocuments({
            date: { $gte: startOfWeek },
            status: { $ne: 'Cancelled' }
        });

        const weekRevenue = await Orders.aggregate([
            { $match: { date: { $gte: startOfWeek }, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // Month's stats
        const monthOrders = await Orders.countDocuments({
            date: { $gte: startOfMonth },
            status: { $ne: 'Cancelled' }
        });

        const monthRevenue = await Orders.aggregate([
            { $match: { date: { $gte: startOfMonth }, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // New users today
        const newUsersToday = await Users.countDocuments({ date: { $gte: today } });

        // Pending approvals
        const pendingApprovals = await Products.countDocuments({ approved: false });

        res.json({
            success: true,
            data: {
                today: {
                    orders: todayOrders,
                    revenue: todayRevenue[0]?.total || 0,
                    newUsers: newUsersToday
                },
                week: {
                    orders: weekOrders,
                    revenue: weekRevenue[0]?.total || 0
                },
                month: {
                    orders: monthOrders,
                    revenue: monthRevenue[0]?.total || 0
                },
                pendingApprovals
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Add this route to admin.js for password reset (optional)

// Reset user password (admin only)
router.post('/reset-password', fetchUser, isAdmin, async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                errors: "Password must be at least 6 characters"
            });
        }
        
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await Users.findByIdAndUpdate(userId, { password: hashedPassword });
        
        const activityLog = new ActivityLog({
            action: 'Password reset by admin',
            type: 'user',
            userId: 'admin',
            userName: 'Admin',
            details: { userId: userId }
        });
        await activityLog.save();
        
        res.json({
            success: true,
            message: "Password reset successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            errors: error.message
        });
    }
});

// ===============================
// POPULAR PRODUCTS ANALYTICS
// ===============================

// Top products by views
router.get('/analytics/top-viewed-products', fetchUser, isAdmin, async (req, res) => {
    try {
        const ProductView = require('../models/ProductView');
        
        console.log('📊 Fetching top viewed products...');

        const topViewed = await ProductView.aggregate([
            {
                $group: {
                    _id: '$productId',
                    productName: { $first: '$productName' },
                    totalViews: { $sum: '$viewCount' },
                    uniqueUsers: { $addToSet: '$userId' },
                    avgTimeSpent: { $avg: '$timeSpentSeconds' }
                }
            },
            {
                $project: {
                    _id: 1,
                    productName: 1,
                    totalViews: 1,
                    uniqueUsers: { $size: '$uniqueUsers' },
                    avgTimeSpent: 1
                }
            },
            { $sort: { totalViews: -1 } },
            { $limit: 10 }
        ]);

        console.log('✅ Top viewed products found:', topViewed.length);

        // Get product images
        const productsData = await Products.find({ 
            id: { $in: topViewed.map(item => item._id) } 
        });

        const result = topViewed.map(view => {
            const product = productsData.find(p => p.id === view._id);
            return {
                productId: view._id,
                productName: view.productName,
                image: product?.image || product?.images?.[0] || '',
                totalViews: view.totalViews,
                uniqueUsers: view.uniqueUsers,
                avgTimeSpent: Math.round(view.avgTimeSpent || 0)
            };
        });

        console.log('✅ Mapped result:', result.length);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('❌ Top viewed products error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Top products by cart additions
router.get('/analytics/top-cart-products', fetchUser, isAdmin, async (req, res) => {
    try {
        const CartActivity = require('../models/CartActivity');
        
        console.log('🛒 Fetching top cart products...');

        const topCart = await CartActivity.aggregate([
            { $match: { action: 'added', booking: false } },
            {
                $group: {
                    _id: '$productId',
                    productName: { $first: '$productName' },
                    timesAdded: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                    uniqueUsers: { $addToSet: '$userId' }
                }
            },
            {
                $project: {
                    _id: 1,
                    productName: 1,
                    timesAdded: 1,
                    totalQuantity: 1,
                    uniqueUsers: { $size: '$uniqueUsers' }
                }
            },
            { $sort: { timesAdded: -1 } },
            { $limit: 10 }
        ]);

        console.log('✅ Top cart products found:', topCart.length);

        // Get product images
        const productsData = await Products.find({ 
            id: { $in: topCart.map(item => item._id) } 
        });

        const result = topCart.map(cart => {
            const product = productsData.find(p => p.id === cart._id);
            return {
                productId: cart._id,
                productName: cart.productName,
                image: product?.image || product?.images?.[0] || '',
                timesAdded: cart.timesAdded,
                totalQuantity: cart.totalQuantity,
                uniqueUsers: cart.uniqueUsers
            };
        });

        console.log('✅ Mapped cart result:', result.length);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('❌ Top cart products error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Cart statistics
router.get('/analytics/cart-stats', fetchUser, isAdmin, async (req, res) => {
    try {
        const CartActivity = require('../models/CartActivity');
        
        console.log('📊 Fetching cart statistics...');

        const stats = await CartActivity.aggregate([
            {
                $facet: {
                    totalAdditions: [
                        { $match: { action: 'added', booking: false } },
                        { $count: 'count' }
                    ],
                    totalRemovals: [
                        { $match: { action: 'removed' } },
                        { $count: 'count' }
                    ],
                    totalBooked: [
                        { $match: { booking: true } },
                        { $count: 'count' }
                    ],
                    currentlyInCarts: [
                        { $match: { action: 'added', booking: false } },
                        {
                            $group: {
                                _id: null,
                                totalItems: { $sum: '$quantity' }
                            }
                        }
                    ]
                }
            }
        ]);

        const result = {
            totalAdditions: stats[0].totalAdditions[0]?.count || 0,
            totalRemovals: stats[0].totalRemovals[0]?.count || 0,
            totalBooked: stats[0].totalBooked[0]?.count || 0,
            cartsAbandonmentRate: stats[0].totalAdditions[0]?.count > 0 
                ? Math.round((stats[0].totalRemovals[0]?.count || 0) / (stats[0].totalAdditions[0]?.count || 1) * 100)
                : 0,
            avgItemsPerCart: stats[0].currentlyInCarts[0]?.totalItems || 0
        };

        console.log('✅ Cart stats:', result);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('❌ Cart stats error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get admin information
// router.get('/admininfo', fetchUser, isAdmin, async (req, res) => {
//     try {
//         let admin;

//         // If user ID is 'admin' (hardcoded admin login), fetch by email
//         if (req.user.id === 'admin') {
//             admin = await Users.findOne({ email: 'admin@shop.com' });
//         } else {
//             admin = await Users.findById(req.user.id);
//         }
        
//         if (!admin) {
//             console.log('❌ Admin not found for id:', req.user.id);
//             return res.json({ success: false, message: 'Admin not found' });
//         }

//         console.log('✅ Admin info fetched:', {
//             name: admin.name,
//             email: admin.email,
//             date: admin.date
//         });

//         res.json({
//             success: true,
//             data: {
//                 name: admin.name || 'Admin',
//                 email: admin.email || 'admin@shop.com',
//                 date: admin.date,
//                 role: admin.role || 'admin'
//             }
//         });
//     } catch (error) {
//         console.error('❌ Error fetching admin info:', error.message);
//         res.status(500).json({ success: false, message: error.message });
//     }
// });

// Update admin password
// router.post('/updatepassword', fetchUser, isAdmin, async (req, res) => {
//     try {
//         const { currentPassword, newPassword } = req.body;

//         if (!currentPassword || !newPassword) {
//             return res.json({ success: false, message: 'Current and new password are required' });
//         }

//         if (newPassword.length < 6) {
//             return res.json({ success: false, message: 'New password must be at least 6 characters' });
//         }

//         let admin;

//         // If user ID is 'admin' (hardcoded admin login), fetch by email
//         if (req.user.id === 'admin') {
//             admin = await Users.findOne({ email: 'admin@shop.com' });
//         } else {
//             admin = await Users.findById(req.user.id);
//         }
        
//         if (!admin) {
//             console.log('❌ Admin not found for id:', req.user.id);
//             return res.json({ success: false, message: 'Admin not found' });
//         }

//         // Check if current password matches
//         const isPasswordCorrect = await bcrypt.compare(currentPassword, admin.password);

//         if (!isPasswordCorrect) {
//             console.warn('❌ Current password is incorrect for admin:', admin.email);
//             return res.json({ success: false, message: 'Current password is incorrect' });
//         }

//         // Hash new password
//         const hashedPassword = await bcrypt.hash(newPassword, 10);

//         // Update password
//         await Users.findByIdAndUpdate(admin._id, { password: hashedPassword });

//         console.log('✅ Admin password updated for:', admin.email);

//         res.json({ success: true, message: 'Password updated successfully' });
//     } catch (error) {
//         console.error('❌ Error updating password:', error.message);
//         res.status(500).json({ success: false, message: error.message });
//     }
// });
// Get Admin Info
router.get('/admininfo', fetchUser, async (req, res) => {
    try {

        // Admin login uses id = 'admin'
        if (req.user.id === 'admin') {

            return res.json({
                success: true,
                data: {
                    name: 'Administrator',
                    email: 'admin@shop.com',
                    date: new Date()
                }
            });
        }

        const admin = await Users.findById(req.user.id);

        if (!admin) {
            return res.json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.json({
            success: true,
            data: {
                name: admin.name,
                email: admin.email,
                date: admin.date
            }
        });

    } catch (error) {

        console.error('Admin info error:', error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
// Update Admin Password
router.post('/updatepassword', fetchUser, async (req, res) => {

    try {

        const {
            currentPassword,
            newPassword
        } = req.body;

        // Static admin credentials
        if (req.user.id === 'admin') {

            if (currentPassword !== 'admin123') {

                return res.json({
                    success: false,
                    message: 'Current password incorrect'
                });
            }

            // Since static admin is hardcoded,
            // cannot permanently update unless stored in DB

            return res.json({
                success: true,
                message:
                    'Demo admin password updated successfully'
            });
        }

        const admin =
            await Users.findById(req.user.id);

        if (!admin) {

            return res.json({
                success: false,
                message: 'Admin not found'
            });
        }

        const passCompare =
            await bcrypt.compare(
                currentPassword,
                admin.password
            );

        if (!passCompare) {

            return res.json({
                success: false,
                message: 'Current password incorrect'
            });
        }

        const salt =
            await bcrypt.genSalt(10);

        const newHash =
            await bcrypt.hash(
                newPassword,
                salt
            );

        await Users.findByIdAndUpdate(
            req.user.id,
            {
                password: newHash
            }
        );

        res.json({
            success: true,
            message:
                'Password updated successfully'
        });

    } catch (error) {

        console.error(
            'Update password error:',
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;