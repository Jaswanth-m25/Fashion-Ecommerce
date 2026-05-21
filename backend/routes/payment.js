const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Orders = require('../models/Order');
const Products = require('../models/Product');
const Users = require('../models/User');
const ActivityLog = require('../models/Activity');
const VendorPerformance = require('../models/VendorPerformance');
const UserAnalytics = require('../models/UserAnalytics');
const fetchUser = require('../middleware/fetchUser');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_key_secret'
});

// Create Razorpay order
router.post('/create-order', fetchUser, async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, errors: 'Invalid amount' });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(amount * 100), // Amount in paise
            currency: currency,
            receipt: receipt || `receipt_${Date.now()}`,
            notes: {
                userId: req.user.id,
                orderType: 'ecommerce'
            }
        });

        res.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, errors: error.message });
    }
});

// Verify payment and place order
router.post(
    '/verify-payment',
    fetchUser,
    async (req, res) => {

        try {

            const crypto = require('crypto');

            const {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,

                products,
                address,
                paymentMethod

            } = req.body;

            /* =========================================
               VERIFY SIGNATURE
            ========================================= */

            const generated_signature =
                crypto
                    .createHmac(
                        'sha256',
                        process.env.RAZORPAY_KEY_SECRET
                    )
                    .update(
                        razorpay_order_id +
                        "|" +
                        razorpay_payment_id
                    )
                    .digest('hex');

            if (
                generated_signature !==
                razorpay_signature
            ) {

                return res.json({
                    success: false,
                    errors: 'Invalid payment signature'
                });
            }

            /* =========================================
               USER
            ========================================= */

            let user =
                await Users.findById(
                    req.user.id
                );

            if (
                !user &&
                req.user.id !== 'admin'
            ) {

                return res.json({
                    success: false,
                    errors: 'User not found'
                });
            }

            /* =========================================
               ORDER ID
            ========================================= */

            let orders =
                await Orders.find({});

            let id =
                orders.length > 0
                    ? orders.slice(-1)[0].id + 1
                    : 1;

            /* =========================================
               PRODUCTS
            ========================================= */

            const productsToSave = [];

            for (const item of products) {

                const productInfo =
                    await Products.findOne({
                        id: Number(
                            item.productId ||
                            item.id
                        )
                    });

                if (productInfo) {

                    let vName =
                        productInfo.vendorName;

                    let vId =
                        productInfo.vendorId ||
                        'admin';

                    productsToSave.push({

                        id:
                            productInfo.id,

                        name:
                            productInfo.name,

                        price:
                            productInfo.new_price,

                        image:
                            productInfo.image,

                        size:
                            item.size || '',

                        quantity:
                            item.quantity,

                        vendorId:
                            vId,

                        vendorName:
                            vName
                    });
                }
            }

            if (
                productsToSave.length === 0
            ) {

                return res.json({
                    success: false,
                    errors:
                        'No valid products found'
                });
            }

            /* =========================================
               TOTAL
            ========================================= */

            const totalAmount =
                productsToSave.reduce(
                    (acc, p) =>
                        acc +
                        (
                            p.price *
                            p.quantity
                        ),
                    0
                );

            /* =========================================
               SAVE ORDER
            ========================================= */

            const order =
                new Orders({

                    id,

                    userId:
                        req.user.id,

                    userName:
                        user
                            ? user.name
                            : 'Admin',

                    userEmail:
                        user
                            ? user.email
                            : 'admin@shop.com',

                    products:
                        productsToSave,

                    totalAmount,

                    address,

                    status:
                        'Processing',

                    paymentMethod:
                        paymentMethod ||
                        'razorpay',

                    paymentId:
                        razorpay_payment_id,

                    razorpayOrderId:
                        razorpay_order_id
                });

            await order.save();

            /* =========================================
               UPDATE STOCK
            ========================================= */

            for (const item of productsToSave) {

                const product = await Products.findOne({ id: item.id });

                if (product) {
                    // Update size-specific stock if available
                    if (product.sizeStocks && item.size) {
                        const currentSizeStock = product.sizeStocks.get(item.size) || 0;
                        product.sizeStocks.set(item.size, Math.max(0, currentSizeStock - item.quantity));
                        await Products.findOneAndUpdate(
                            { id: item.id },
                            { sizeStocks: product.sizeStocks }
                        );
                    }

                    // Also update total stock for backward compatibility
                    await Products.findOneAndUpdate(
                        { id: item.id },
                        { $inc: { stock: -item.quantity } }
                    );
                }
            }

            /* =========================================
               CLEAR CART
            ========================================= */

            if (user) {

                await Users.findByIdAndUpdate(
                    req.user.id,
                    {
                        cartData: {}
                    }
                );
            }

            /* =========================================
               RESPONSE
            ========================================= */

            res.json({
                success: true,
                orderId: id
            });

        } catch (err) {

            console.error(
                "VERIFY PAYMENT ERROR:",
                err
            );

            res.status(500).json({
                success: false,
                errors: err.message
            });
        }
    }
);

module.exports = router;
