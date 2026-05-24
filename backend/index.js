const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');
const wishlistRoutes = require('./routes/wishlist');
const vendorRoutes = require('./routes/vendor');
const paymentRoutes = require('./routes/payment');
const trackingRoutes = require('./routes/tracking');

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/images', express.static('upload/images'));

// Routes
app.use('/', authRoutes);
app.use('/', productRoutes);
app.use('/admin', adminRoutes);
app.use('/', orderRoutes);
app.use('/', wishlistRoutes);
app.use('/vendor', vendorRoutes);
app.use('/payment', paymentRoutes);
app.use('/', trackingRoutes);

// Test route
app.get('/', (req, res) => {
    res.send("E-commerce Backend is running!");
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
