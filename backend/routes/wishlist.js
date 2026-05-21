const express = require('express');
const router = express.Router();
const Users = require('../models/User');
const UserAnalytics = require('../models/UserAnalytics');
const fetchUser = require('../middleware/fetchUser');

// Add to wishlist
router.post('/addtowishlist', fetchUser, async (req, res) => {
    if (req.user.id === 'admin') {
        return res.json({ success: false, message: "Admin does not have a wishlist" });
    }

    let userData = await Users.findById(req.user.id);
    if (!userData.wishlistData.includes(req.body.itemId)) {
        userData.wishlistData.push(req.body.itemId);
        await Users.findByIdAndUpdate(req.user.id, { wishlistData: userData.wishlistData });

        await UserAnalytics.findOneAndUpdate(
            { userId: req.user.id },
            { $inc: { wishlistCount: 1 } },
            { upsert: true }
        );

        res.json({ success: true, message: "Added to Wishlist" });
    } else {
        res.json({ success: false, message: "Already in Wishlist" });
    }
});

// Remove from wishlist
router.post('/removefromwishlist', fetchUser, async (req, res) => {
    if (req.user.id === 'admin') {
        return res.json({ success: false, message: "Admin does not have a wishlist" });
    }

    let userData = await Users.findById(req.user.id);
    if (userData.wishlistData.includes(req.body.itemId)) {
        userData.wishlistData = userData.wishlistData.filter(id => id !== req.body.itemId);
        await Users.findByIdAndUpdate(req.user.id, { wishlistData: userData.wishlistData });

        await UserAnalytics.findOneAndUpdate(
            { userId: req.user.id },
            { $inc: { wishlistCount: -1 } }
        );

        res.json({ success: true, message: "Removed from Wishlist" });
    } else {
        res.json({ success: false, message: "Not in Wishlist" });
    }
});

// Get wishlist
router.post('/getwishlist', fetchUser, async (req, res) => {
    if (req.user.id === 'admin') return res.json([]);
    let userData = await Users.findById(req.user.id);
    res.json(userData.wishlistData || []);
});

module.exports = router;