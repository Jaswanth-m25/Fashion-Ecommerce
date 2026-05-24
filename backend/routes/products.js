const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Products = require('../models/Product');
const ActivityLog = require('../models/Activity');
const VendorPerformance = require('../models/VendorPerformance');
const fetchUser = require('../middleware/fetchUser');
const isVendor = require('../middleware/isVendor');
const isAdmin = require('../middleware/isAdmin');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
});
const upload = multer({ storage: storage });

// Image upload endpoint
router.post(
    '/upload',
    upload.array('product', 10),
    (req, res) => {

        const image_urls =
            req.files.map((file) => (

                `https://fashion-ecommerce-ak78.onrender.com/images/${file.filename}`
            ));

        res.json({
            success: 1,
            image_urls
        });
    }
);

// Get all approved products (for homepage)
router.get('/allproducts', async (req, res) => {
    let products = await Products.find({ approved: true });
    res.send(products);
});

// Vendor: Add product
router.post('/vendoraddproduct', fetchUser, isVendor, async (req, res) => {
    try {
        let products = await Products.find({});
        let id = products.length > 0 ? products.slice(-1)[0].id + 1 : 1;

        const price = Number(req.body.price);
        const discount = Number(req.body.discount || 0);
        const new_price = price - (price * (discount / 100));

        let vendorName = "Admin";
        if (req.user.id !== 'admin') {
            let user = await require('../models/User').findById(req.user.id);
            vendorName = user.name;
        }

        // Calculate total stock from sizeStocks
        let sizeStocksMap = new Map();
        let totalStock = 0;
        if (req.body.sizeStocks && typeof req.body.sizeStocks === 'object') {
            for (const [size, quantity] of Object.entries(req.body.sizeStocks)) {
                const qty = Number(quantity) || 0;
                sizeStocksMap.set(size, qty);
                totalStock += qty;
            }
        }

        const product = new Products({
            id: id,
            name: req.body.name,
            image: req.body.images?.[0] || '',
            images: req.body.images || [],
            category: req.body.category,
            price: price,
            discount: discount,
            new_price: Math.round(new_price),
            description: req.body.description,
            sizes: req.body.sizes,
            fit: req.body.fit,
            material: req.body.material,
            color: req.body.color,
            stock: totalStock || req.body.stock || 0,
            sizeStocks: sizeStocksMap,
            brand: req.body.brand,
            tags: req.body.tags,
            vendorId: req.user.id,
            vendorName: vendorName,
            approved: false,
        });

        await product.save();

        // Update vendor performance
        await VendorPerformance.findOneAndUpdate(
            { vendorId: req.user.id },
            {
                $inc: { totalProducts: 1 },
                $set: { vendorName: vendorName, lastUpdated: new Date() }
            },
            { upsert: true }
        );

        // Log activity
        const activityLog = new ActivityLog({
            action: 'Product added',
            type: 'product',
            userId: req.user.id,
            userName: vendorName,
            details: { productName: req.body.name, productId: id }
        });
        await activityLog.save();

        res.json({ success: true, name: req.body.name });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Vendor: Get their products
router.get('/vendorproducts', fetchUser, isVendor, async (req, res) => {
    let products = await Products.find({ vendorId: req.user.id });
    res.send(products);
});

// Vendor: Update product
router.post('/vendorupdateproduct', fetchUser, isVendor, async (req, res) => {
    try {
        const price = Number(req.body.price);
        const discount = Number(req.body.discount || 0);
        const new_price = price - (price * (discount / 100));

        // Calculate total stock from sizeStocks
        let sizeStocksMap = new Map();
        let totalStock = 0;
        if (req.body.sizeStocks && typeof req.body.sizeStocks === 'object') {
            for (const [size, quantity] of Object.entries(req.body.sizeStocks)) {
                const qty = Number(quantity) || 0;
                sizeStocksMap.set(size, qty);
                totalStock += qty;
            }
        }

        const updatedProduct = await Products.findOneAndUpdate(
            { id: req.body.id, vendorId: req.user.id },
            {
                name: req.body.name,
                image: req.body.images?.[0] || '',
                images: req.body.images || [],
                category: req.body.category,
                price: price,
                discount: discount,
                new_price: Math.round(new_price),
                description: req.body.description,
                sizes: req.body.sizes,
                fit: req.body.fit,
                material: req.body.material,
                color: req.body.color,
                stock: totalStock || req.body.stock || 0,
                sizeStocks: sizeStocksMap.size > 0 ? sizeStocksMap : req.body.sizeStocks,
                brand: req.body.brand,
                tags: req.body.tags,
                approved: false
            },
            { new: true }
        );

        if (updatedProduct) {
            const activityLog = new ActivityLog({
                action: 'Product updated',
                type: 'product',
                userId: req.user.id,
                userName: updatedProduct.vendorName,
                details: { productName: req.body.name, productId: req.body.id }
            });
            await activityLog.save();

            res.json({ success: true, name: req.body.name });
        } else {
            res.json({ success: false, errors: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Vendor: Remove product
router.post('/vendorremoveproduct', fetchUser, isVendor, async (req, res) => {
    try {
        const product = await Products.findOne({ id: req.body.id, vendorId: req.user.id });
        if (!product) {
            return res.status(403).json({ success: false, error: 'Product not found or unauthorized' });
        }
        await Products.findOneAndDelete({ id: req.body.id, vendorId: req.user.id });

        if (product && product.vendorId !== 'admin') {
            await VendorPerformance.findOneAndUpdate(
                { vendorId: product.vendorId },
                { $inc: { totalProducts: -1 } }
            );
        }

        const activityLog = new ActivityLog({
            action: 'Product removed',
            type: 'product',
            userId: req.user.id,
            details: { productName: req.body.name, productId: req.body.id }
        });
        await activityLog.save();

        res.json({ success: true, name: req.body.name });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;