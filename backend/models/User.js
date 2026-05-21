const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

    name: String,

    email: {
        type: String,
        unique: true
    },

    password: String,

    cartData: Object,

    wishlistData: {
        type: Array,
        default: []
    },

    role: {
        type: String,
        default: 'customer'
    },

    date: {
        type: Date,
        default: Date.now
    },

    // Vendor Profile Fields
    storeName: String,
    storeDescription: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    bankAccountName: String,
    bankAccountNumber: String,
    bankIFSC: String,
    panNumber: String,
    gstNumber: String,
    businessType: String,
    yearsInBusiness: Number,
    website: String

});

module.exports = mongoose.model(
    'Users',
    UserSchema,
    'LoginData'
);