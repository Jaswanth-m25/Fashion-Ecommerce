const express = require('express');
const router = express.Router();
const ProductView = require('../models/ProductView');
const CartActivity = require('../models/CartActivity');
const fetchUser = require('../middleware/fetchUser');
const Products = require('../models/Product');
const Users = require('../models/User');

// Track product view
router.post('/trackview', fetchUser, async (req, res) => {
    try {
        const { productId, timeSpent } = req.body;

        console.log('📊 Tracking view request:', {
            productId,
            timeSpent,
            userId: req.user.id,
            userName: req.user.name
        });

        if (!productId) {
            console.error('❌ No productId provided');
            return res.json({ success: false, message: 'Product ID is required' });
        }

        // Get product details
        const product = await Products.findOne({ id: Number(productId) });
        const user = await Users.findById(req.user.id);

        console.log('🔍 Product found:', !!product);
        console.log('🔍 User found:', !!user);

        if (!product) {
            console.error('❌ Product not found with id:', productId);
            return res.json({ success: false, message: 'Product not found' });
        }

        // Check if view already exists for this user-product combo
        const existingView = await ProductView.findOne({
            userId: req.user.id,
            productId: Number(productId)
        });

        if (existingView) {
            // Update existing view
            existingView.viewCount += 1;
            existingView.lastViewedAt = new Date();
            existingView.timeSpentSeconds = (existingView.timeSpentSeconds || 0) + (timeSpent || 0);
            await existingView.save();
            console.log('✅ View count updated:', existingView.viewCount);
        } else {
            // Create new view record
            const newView = new ProductView({
                userId: req.user.id,
                userName: user?.name || 'Anonymous',
                userEmail: user?.email || 'unknown@email.com',
                productId: Number(productId),
                productName: product.name,
                category: product.category,
                vendorId: product.vendorId || 'admin',
                vendorName: product.vendorName || 'Admin',
                viewCount: 1,
                timeSpentSeconds: timeSpent || 0
            });

            await newView.save();
            console.log('✅ New view created:', newView._id);
        }

        res.json({ success: true, message: 'Product view tracked successfully' });
    } catch (err) {
        console.error('❌ Track View Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Track cart activity (add/remove/update)
router.post('/trackcart', fetchUser, async (req, res) => {
    try {
        const { productId, action, quantity, size } = req.body;

        console.log('🛒 Tracking cart activity request:', {
            productId,
            action,
            quantity,
            size,
            userId: req.user.id
        });

        if (!productId || !action) {
            console.error('❌ Missing productId or action');
            return res.json({ success: false, message: 'Product ID and action are required' });
        }

        // Get product details
        const product = await Products.findOne({ id: Number(productId) });
        const user = await Users.findById(req.user.id);

        console.log('🔍 Product found:', !!product);
        console.log('🔍 User found:', !!user);

        if (!product) {
            console.error('❌ Product not found with id:', productId);
            return res.json({ success: false, message: 'Product not found' });
        }

        // Create cart activity record
        const cartActivity = new CartActivity({
            userId: req.user.id,
            userName: user?.name || 'Anonymous',
            userEmail: user?.email || 'unknown@email.com',
            productId: Number(productId),
            productName: product.name,
            category: product.category,
            price: product.new_price || product.price,
            quantity: quantity || 1,
            size: size || 'One Size',
            action: action, // 'added', 'removed', 'updated'
            vendorId: product.vendorId || 'admin',
            vendorName: product.vendorName || 'Admin'
        });

        await cartActivity.save();

        console.log('✅ Cart activity saved:', {
            action: cartActivity.action,
            productId: cartActivity.productId,
            id: cartActivity._id
        });

        res.json({ success: true, message: `Product ${action} to cart successfully` });
    } catch (err) {
        console.error('❌ Track Cart Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get user's product views
router.get('/userviews', fetchUser, async (req, res) => {
    try {
        const views = await ProductView.find({ userId: req.user.id })
            .sort({ lastViewedAt: -1 })
            .limit(50);

        res.json(views);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get user's cart activity
router.get('/usercartactivity', fetchUser, async (req, res) => {
    try {
        const activities = await CartActivity.find({ userId: req.user.id })
            .sort({ actionedAt: -1 })
            .limit(100);

        res.json(activities);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get product view stats
router.get('/product/:productId/views', async (req, res) => {
    try {
        const views = await ProductView.find({ productId: Number(req.params.productId) });
        const totalViews = views.reduce((sum, v) => sum + v.viewCount, 0);
        const uniqueUsers = views.length;
        const avgTimeSpent = views.length > 0
            ? Math.round(views.reduce((sum, v) => sum + v.timeSpentSeconds, 0) / views.length)
            : 0;

        res.json({
            productId: req.params.productId,
            totalViews,
            uniqueUsers,
            avgTimeSpentSeconds: avgTimeSpent,
            viewDetails: views
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get cart activity stats
router.get('/product/:productId/cartactivity', async (req, res) => {
    try {
        const activities = await CartActivity.find({ productId: Number(req.params.productId) });
        const added = activities.filter(a => a.action === 'added').length;
        const removed = activities.filter(a => a.action === 'removed').length;
        const currentCart = added - removed;

        res.json({
            productId: req.params.productId,
            timesAdded: added,
            timesRemoved: removed,
            currentInCarts: currentCart,
            activities: activities
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Diagnostic endpoint - Check if tracking data exists
router.get('/tracking-stats', fetchUser, async (req, res) => {
    try {
        const viewCount = await ProductView.countDocuments();
        const cartActivityCount = await CartActivity.countDocuments();
        const userViewCount = await ProductView.countDocuments({ userId: req.user.id });
        const userCartActivityCount = await CartActivity.countDocuments({ userId: req.user.id });

        res.json({
            success: true,
            stats: {
                totalProductViews: viewCount,
                totalCartActivities: cartActivityCount,
                userProductViews: userViewCount,
                userCartActivities: userCartActivityCount,
                userId: req.user.id,
                userName: req.user.name
            }
        });
    } catch (err) {
        console.error('❌ Diagnostic Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
