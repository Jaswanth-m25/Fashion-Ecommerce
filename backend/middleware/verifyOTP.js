const OTP = require('../models/OTP');

const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp, purpose } = req.body;

        if (!email || !otp || !purpose) {
            return res.status(400).json({
                success: false,
                errors: "Email, OTP and purpose are required"
            });
        }

        // Find valid OTP
        const otpRecord = await OTP.findOne({
            email: email,
            otp: otp,
            purpose: purpose,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                errors: "Invalid or expired OTP"
            });
        }

        // Check attempts (max 3 attempts)
        if (otpRecord.attempts >= 3) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                errors: "Too many failed attempts. Please request a new OTP."
            });
        }

        // Increment attempts
        otpRecord.attempts += 1;
        await otpRecord.save();

        // OTP is valid, proceed to next middleware/route
        // Note: DON'T delete OTP here, let the route handle it after successful completion
        next();

    } catch (error) {
        console.error("OTP Verification Error:", error);
        res.status(500).json({
            success: false,
            errors: "OTP verification failed"
        });
    }
};

module.exports = verifyOTP;