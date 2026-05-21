const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({

    id: Number,

    name: String,

    image: String,

images: {
    type: [String],
    default: []
},
    category: String,

    price: Number,

    discount: {
        type: Number,
        default: 0
    },

    new_price: Number,

    available: {
        type: Boolean,
        default: true
    },

    approved: {
        type: Boolean,
        default: false
    },

    description: String,

    sizes: [String],

    fit: String,

    material: String,

    color: String,

    vendorId: String,

    vendorName: String,

    stock: {
        type: Number,
        default: 0
    },

    sizeStocks: {
        type: Map,
        of: Number,
        default: new Map()
    },

    brand: String,

    tags: String,

    date: {
        type: Date,
        default: Date.now
    },

    removedByAdmin: {
        type: Boolean,
        default: false
    },

    removedAt: {
        type: Date,
        default: null
    },

    rejectedByAdmin: {
        type: Boolean,
        default: false
    },

    rejectedAt: {
        type: Date,
        default: null
    },

    rejectionReason: {
        type: String,
        default: null
    }

});

module.exports = mongoose.model(
    'Product',
    ProductSchema
);