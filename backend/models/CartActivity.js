const mongoose = require('mongoose');

const CartActivitySchema = new mongoose.Schema({
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

    price: Number,

    quantity: Number,

    size: String,

    action: {
        type: String,
        enum: ['added', 'removed', 'updated'],
        required: true
    },

    vendorId: String,

    vendorName: String,

    booking: {
        type: Boolean,
        default: false
    },

    actionedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for efficient queries
CartActivitySchema.index({ userId: 1, actionedAt: -1 });
CartActivitySchema.index({ productId: 1 });
CartActivitySchema.index({ actionedAt: -1 });
CartActivitySchema.index({ action: 1 });

module.exports = mongoose.model('CartActivity', CartActivitySchema);
