const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({

    id: Number,

    userId: String,

    userName: String,

    userEmail: String,

    products: Array,

    totalAmount: Number,

    address: Object,

    status: {
        type: String,
        default: 'Processing'
    },

    paymentMethod: {
        type: String,
        default: 'COD'
    },

    date: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    'Orders',
    OrderSchema
);