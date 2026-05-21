const mongoose = require('mongoose');

const VendorPerformanceSchema = new mongoose.Schema({

    vendorId: {
        type: String,
        required: true
    },

    vendorName: {
        type: String,
        required: true
    },

    totalProducts: {
        type: Number,
        default: 0
    },

    approvedProducts: {
        type: Number,
        default: 0
    },

    totalSales: {
        type: Number,
        default: 0
    },

    totalOrders: {
        type: Number,
        default: 0
    },

    totalRevenue: {
        type: Number,
        default: 0
    },

    averageRating: {
        type: Number,
        default: 0
    },

    lastUpdated: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    'VendorPerformance',
    VendorPerformanceSchema
);