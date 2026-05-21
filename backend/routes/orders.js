const express = require('express');
const router = express.Router();
const Orders = require('../models/Order');
const Products = require('../models/Product');
const Users = require('../models/User');
const ActivityLog = require('../models/Activity');
const VendorPerformance = require('../models/VendorPerformance');
const UserAnalytics = require('../models/UserAnalytics');
const fetchUser = require('../middleware/fetchUser');
const isVendor = require('../middleware/isVendor');
const isAdmin = require('../middleware/isAdmin');

// Place an order
router.post('/placeorder', fetchUser, async (req, res) => {
    try {
        let orders = await Orders.find({});
        let id = orders.length > 0 ? orders.slice(-1)[0].id + 1 : 1;

        let user = await Users.findById(req.user.id);
        if (!user && req.user.id !== 'admin') {
            return res.json({ success: false, errors: "User not found" });
        }

        const productsToSave = [];
        const uniqueVendorNames = new Set();

        for (const item of req.body.products) {

    const productId =
        item.productId || item.id;

    const productInfo =
        await Products.findOne({
            id: Number(productId)
        });
            if (productInfo) {
                let vName = productInfo.vendorName;
                let vId = productInfo.vendorId || 'admin';

                if (!vName || vName === 'Admin') {
                    const adminUser = await Users.findOne({ role: 'admin' });
                    vName = adminUser ? adminUser.name : 'Primary Administrator';
                }

                productsToSave.push({
                    id: productInfo.id,
                    name: productInfo.name,
                    price: productInfo.new_price,
                    image: productInfo.image,
                    size: item.size || '',
                    quantity: item.quantity,
                    vendorId: vId,
                    vendorName: vName
                });
                uniqueVendorNames.add(vName);
            }
        }

        if (productsToSave.length === 0) {
            return res.json({ success: false, errors: "No valid products found in order" });
        }

        const totalAmount = productsToSave.reduce((acc, p) => acc + (p.price * p.quantity), 0);

        const order = new Orders({
            id: id,
            userId: req.user.id,
            userName: user ? user.name : 'Admin',
            userEmail: user ? user.email : 'admin@shop.com',
            products: productsToSave,
            totalAmount: totalAmount,
            address: req.body.address,
            status: "Processing",
            paymentMethod: req.body.paymentMethod || "COD"
        });

        await order.save();

        // Update stock
        for (const item of productsToSave) {
            await Products.findOneAndUpdate(
                { id: item.id },
                { 
                    $inc: { stock: -item.quantity },
                    available: false
                }
            );
        }

        // Clear cart
        if (user) {
            let emptyCart = {};
            for (let i = 0; i < 300; i++) emptyCart[i] = 0;
            await Users.findByIdAndUpdate(req.user.id, { cartData: emptyCart });

            await UserAnalytics.findOneAndUpdate(
                { userId: req.user.id },
                {
                    $inc: { totalOrders: 1, totalSpent: totalAmount },
                    $set: { lastActive: new Date() }
                },
                { upsert: true }
            );
        }

        // Update vendor performance
        const vendorSales = {};
        for (const item of productsToSave) {
            vendorSales[item.vendorId] = (vendorSales[item.vendorId] || 0) + (item.price * item.quantity);
        }

        for (const [vendorId, revenue] of Object.entries(vendorSales)) {
            await VendorPerformance.findOneAndUpdate(
                { vendorId: vendorId },
                {
                    $inc: { totalOrders: 1, totalRevenue: revenue, totalSales: productsToSave.filter(p => p.vendorId === vendorId).length },
                    $set: { lastUpdated: new Date() }
                }
            );
        }

        // Mark cart activities as booked
        const CartActivity = require('../models/CartActivity');
        const productIds = productsToSave.map(p => p.id);
        
        await CartActivity.updateMany(
            { 
                userId: req.user.id, 
                productId: { $in: productIds },
                action: 'added',
                booking: false
            },
            { $set: { booking: true } }
        );
        
        console.log('✅ Marked cart activities as booked for order:', id);

        // Log activity
        const activityLog = new ActivityLog({
            action: 'Order placed',
            type: 'order',
            userId: req.user.id,
            userName: user ? user.name : 'Admin',
            details: { orderId: id, totalAmount: totalAmount, productsCount: productsToSave.length }
        });
        await activityLog.save();

        res.json({ success: true, orderId: id });
    } catch (err) {
        console.error("PlaceOrder Error:", err);
        res.status(500).json({ success: false, errors: err.message });
    }
});

// Vendor: Get their orders
router.get('/vendor/orders', fetchUser, isVendor, async (req, res) => {
    try {
        if (req.user.id === 'admin') {
            let orders = await Orders.find({});
            return res.json(orders);
        }

        let orders = await Orders.find({});

        let vendorOrders = orders.filter(order => {
            return order.products.some(p => String(p.vendorId) === String(req.user.id));
        }).map(order => {
            const vendorProducts = order.products.filter(p => String(p.vendorId) === String(req.user.id));
            return {
                ...order._doc,
                products: vendorProducts,
                totalAmount: vendorProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0)
            }
        });

        res.json(vendorOrders);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update order status
router.post('/updateorderstatus', fetchUser, isVendor, async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const order = await Orders.findOne({ id: orderId });
        if (!order) return res.json({ success: false, message: "Order not found" });

        const prevStatus = order.status;
        await Orders.findOneAndUpdate({ id: orderId }, { status: status });

        if (status === "Cancelled" && prevStatus !== "Cancelled") {
            // Restock products
            for (const item of order.products) {
                await Products.findOneAndUpdate(
                    { id: item.id },
                    { 
                        $inc: { stock: item.quantity },
                        available: true
                    }
                );
            }
        } else if (prevStatus === "Cancelled" && status !== "Cancelled") {
            // Mark as sold
            for (const item of order.products) {
                await Products.findOneAndUpdate(
                    { id: item.id },
                    { available: false }
                );
            }
        }

        const activityLog = new ActivityLog({
            action: `Order status changed to ${status}`,
            type: 'order',
            userId: req.user.id,
            userName: req.user.id === 'admin' ? 'Admin' : 'Vendor',
            details: { orderId: orderId, previousStatus: prevStatus, newStatus: status }
        });
        await activityLog.save();

        res.json({ success: true, message: "Status updated" });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// Customer: Get their orders
router.get('/customer/orders', fetchUser, async (req, res) => {
    try {
        const orders = await Orders.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Customer: Get specific order details
router.get('/customer/orders/:orderId', fetchUser, async (req, res) => {
    try {
        const order = await Orders.findOne({ 
            id: req.params.orderId, 
            userId: req.user.id 
        });
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;