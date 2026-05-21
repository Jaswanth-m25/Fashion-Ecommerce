const express = require('express');
const router = express.Router();
const VendorPerformance = require('../models/VendorPerformance');
const fetchUser = require('../middleware/fetchUser');
const isVendor = require('../middleware/isVendor');
const User = require('../models/User');

// Get vendor profile
router.get('/vendor-profile', fetchUser, isVendor, async (req, res) => {
    try {
        const vendor = await User.findById(req.user.id);
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }
        
        res.json({
            success: true,
            _id: vendor._id,
            name: vendor.name,
            email: vendor.email,
            storeName: vendor.storeName,
            storeDescription: vendor.storeDescription,
            phone: vendor.phone,
            address: vendor.address,
            city: vendor.city,
            state: vendor.state,
            pincode: vendor.pincode,
            bankAccountName: vendor.bankAccountName,
            bankAccountNumber: vendor.bankAccountNumber,
            bankIFSC: vendor.bankIFSC,
            panNumber: vendor.panNumber,
            gstNumber: vendor.gstNumber,
            businessType: vendor.businessType,
            yearsInBusiness: vendor.yearsInBusiness,
            website: vendor.website
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update vendor profile
router.put('/update-vendor-profile', fetchUser, isVendor, async (req, res) => {
    try {
        const {
            storeName,
            storeDescription,
            phone,
            address,
            city,
            state,
            pincode,
            bankAccountName,
            bankAccountNumber,
            bankIFSC,
            panNumber,
            gstNumber,
            businessType,
            yearsInBusiness,
            website
        } = req.body;

        const vendor = await User.findByIdAndUpdate(
            req.user.id,
            {
                storeName,
                storeDescription,
                phone,
                address,
                city,
                state,
                pincode,
                bankAccountName,
                bankAccountNumber,
                bankIFSC,
                panNumber,
                gstNumber,
                businessType,
                yearsInBusiness,
                website
            },
            { new: true }
        );

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: vendor
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get vendor performance metrics
router.get('/performance', fetchUser, isVendor, async (req, res) => {
    try {
        let performance = await VendorPerformance.findOne({ vendorId: req.user.id });
        if (!performance) {
            performance = {
                vendorId: req.user.id,
                vendorName: 'Vendor',
                totalProducts: 0,
                approvedProducts: 0,
                totalSales: 0,
                totalOrders: 0,
                totalRevenue: 0
            };
        }
        res.json({ success: true, data: performance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get vendor's products count
router.get('/stats', fetchUser, isVendor, async (req, res) => {
    try {
        const Products = require('../models/Product');
        const totalProducts = await Products.countDocuments({ vendorId: req.user.id });
        const approvedProducts = await Products.countDocuments({ vendorId: req.user.id, approved: true });
        const pendingProducts = await Products.countDocuments({ vendorId: req.user.id, approved: false });

        res.json({
            success: true,
            data: {
                totalProducts,
                approvedProducts,
                pendingProducts
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;