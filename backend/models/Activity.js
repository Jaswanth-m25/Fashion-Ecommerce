const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({

    action: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ['product', 'user', 'order', 'vendor'],
        required: true
    },

    userId: String,

    userName: String,

    details: Object,

    date: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    'ActivityLog',
    ActivitySchema
);