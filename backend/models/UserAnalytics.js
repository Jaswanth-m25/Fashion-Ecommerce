const mongoose = require('mongoose');

const UserAnalyticsSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },

    totalOrders: {
        type: Number,
        default: 0
    },

    totalSpent: {
        type: Number,
        default: 0
    },

    wishlistCount: {
        type: Number,
        default: 0
    },

    cartAbandonmentCount: {
        type: Number,
        default: 0
    },

    lastActive: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    'UserAnalytics',
    UserAnalyticsSchema
);