const mongoose = require('mongoose');

const ProductViewSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },

    userName: String,

    userEmail: String,

    productId: {
        type: Number,
        required: true
    },

    productName: String,

    category: String,

    vendorId: String,

    vendorName: String,

    viewCount: {
        type: Number,
        default: 1
    },

    lastViewedAt: {
        type: Date,
        default: Date.now
    },

    viewedAt: {
        type: Date,
        default: Date.now
    },

    timeSpentSeconds: {
        type: Number,
        default: 0
    }
});

// Compound index to find all views by a user for a product
ProductViewSchema.index({ userId: 1, productId: 1 });
ProductViewSchema.index({ productId: 1 });
ProductViewSchema.index({ userId: 1 });
ProductViewSchema.index({ viewedAt: -1 });

module.exports = mongoose.model('ProductView', ProductViewSchema);
