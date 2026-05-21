const mongoose = require('mongoose');

const connectDB = async () => {

    try {

        await mongoose.connect(process.env.MONGO_URI, {
            tls: true,
            tlsAllowInvalidCertificates: true
        });

        console.log("✅ MongoDB Connected");

    } catch (error) {

        console.log("❌ MongoDB Error:", error.message);
    }
};

module.exports = connectDB;