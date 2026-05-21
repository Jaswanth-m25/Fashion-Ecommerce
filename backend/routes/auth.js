const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Users = require('../models/User');
const ActivityLog = require('../models/Activity');
const OTP = require('../models/OTP');
const fetchUser = require('../middleware/fetchUser');
const verifyOTP = require('../middleware/verifyOTP');
const { 
    generateOTP, 
    sendSignupOTP, 
    sendLoginOTP,
    sendPasswordResetOTP,
    sendPasswordResetSuccess
} = require('../utils/emailService');

const ADMIN_EMAIL = 'admin@shop.com';
const ADMIN_PASSWORD = 'admin123';
const SALT_ROUNDS = 10;

/* ========== SIGNUP FLOW ========== */

// Step 1: Request OTP for signup
router.post('/request-signup-otp', async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Validate required fields
        if (!email || !username || !password) {
            return res.status(400).json({
                success: false,
                errors: "All fields are required"
            });
        }

        // Check if user already exists
        let existingUser = await Users.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                errors: "Email already registered. Please login instead."
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                errors: "Password must be at least 6 characters long"
            });
        }

        const otp = generateOTP();

        // Delete old OTPs
        await OTP.deleteMany({ email: email, purpose: 'signup' });

        // Save OTP with user data
        const otpRecord = new OTP({
            email: email,
            otp: otp,
            purpose: 'signup',
            userData: {
                username: username,
                password: password,
                role: req.body.role || 'customer'
            }
        });
        await otpRecord.save();

        // Send OTP via email
        await sendSignupOTP(email, otp, username);

        res.json({
            success: true,
            message: "OTP sent to your email. Please verify to complete signup.",
            email: email
        });

    } catch (error) {
        console.error("Signup OTP Error:", error);
        res.status(500).json({
            success: false,
            errors: "Failed to send OTP. Please try again."
        });
    }
});

// Step 2: Resend signup OTP
router.post('/resend-signup-otp', async (req, res) => {
    try {
        const { email } = req.body;

        const existingOTP = await OTP.findOne({ email: email, purpose: 'signup' });
        if (!existingOTP) {
            return res.status(400).json({
                success: false,
                errors: "No pending signup request. Please start over."
            });
        }

        const otp = generateOTP();

        await OTP.deleteMany({ email: email, purpose: 'signup' });

        const otpRecord = new OTP({
            email: email,
            otp: otp,
            purpose: 'signup',
            userData: existingOTP.userData
        });
        await otpRecord.save();

        await sendSignupOTP(email, otp, existingOTP.userData.username);

        res.json({
            success: true,
            message: "New OTP sent to your email."
        });

    } catch (error) {
        console.error("Resend OTP Error:", error);
        res.status(500).json({
            success: false,
            errors: "Failed to resend OTP. Please try again."
        });
    }
});

// Step 3: Verify OTP and complete signup
router.post('/signup', verifyOTP, async (req, res) => {
    try {
        const { email } = req.body;

        const otpRecord = await OTP.findOne({ email: email, purpose: 'signup' });
        if (!otpRecord || !otpRecord.userData) {
            return res.status(400).json({
                success: false,
                errors: "Invalid request. Please request OTP again."
            });
        }

        const { username, password, role } = otpRecord.userData;

        let check = await Users.findOne({ email: email });
        if (check) {
            return res.status(400).json({
                success: false,
                errors: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        let cart = {};
        for (let i = 0; i < 300; i++) {
            cart[i] = 0;
        }

        const user = new Users({
            name: username,
            email: email,
            password: hashedPassword,
            cartData: cart,
            role: role || 'customer'
        });

        await user.save();

        const activityLog = new ActivityLog({
            action: 'New user registered',
            type: 'user',
            userId: user._id,
            userName: user.name,
            details: { email: user.email, role: user.role }
        });
        await activityLog.save();

        await OTP.deleteMany({ email: email, purpose: 'signup' });

        res.json({
            success: true,
            message: "Account created successfully! Please login."
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({
            success: false,
            errors: "Failed to create account. Please try again."
        });
    }
});

/* ========== LOGIN FLOW ========== */

// Login - Admin bypasses OTP, regular users need OTP
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                errors: "Email and password are required"
            });
        }

        // Check for admin login - DIRECT LOGIN (NO OTP)
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            const token = jwt.sign({
                user: { id: 'admin' }
            }, process.env.JWT_SECRET);

            return res.json({
                success: true,
                token,
                role: 'admin',
                message: "Admin login successful"
            });
        }

        // For regular users, find the user first
        const user = await Users.findOne({ email: email });
        if (!user) {
            return res.status(401).json({
                success: false,
                errors: "Invalid email or password"
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                errors: "Invalid email or password"
            });
        }

        // For regular users - generate and send OTP
        const otp = generateOTP();

        // Delete old OTPs
        await OTP.deleteMany({ email: email, purpose: 'login' });

        // Save OTP with user info
        const otpRecord = new OTP({
            email: email,
            otp: otp,
            purpose: 'login',
            userData: {
                userId: user._id,
                role: user.role
            }
        });
        await otpRecord.save();

        // Send OTP via email
        await sendLoginOTP(email, otp, user.name);

        res.json({
            success: true,
            requiresOTP: true,
            message: "OTP sent to your email. Please verify to complete login.",
            email: email
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            errors: "Login failed. Please try again."
        });
    }
});

// Verify OTP and complete login (for regular users only)
router.post('/verify-login-otp', verifyOTP, async (req, res) => {
    try {
        const { email } = req.body;

        const otpRecord = await OTP.findOne({ email: email, purpose: 'login' });
        if (!otpRecord || !otpRecord.userData) {
            return res.status(400).json({
                success: false,
                errors: "Invalid request. Please login again."
            });
        }

        const { userId, role } = otpRecord.userData;

        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                errors: "User not found"
            });
        }

        const token = jwt.sign({
            user: { id: user._id }
        }, process.env.JWT_SECRET);

        await OTP.deleteMany({ email: email, purpose: 'login' });

        res.json({
            success: true,
            token,
            role: user.role,
            message: "Login successful!"
        });

    } catch (error) {
        console.error("OTP Verification Error:", error);
        res.status(500).json({
            success: false,
            errors: "Verification failed. Please try again."
        });
    }
});

// Resend login OTP (for regular users)
router.post('/resend-login-otp', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await Users.findOne({ email: email });
        if (!user) {
            return res.status(404).json({
                success: false,
                errors: "User not found"
            });
        }

        await OTP.deleteMany({ email: email, purpose: 'login' });

        const otp = generateOTP();

        const otpRecord = new OTP({
            email: email,
            otp: otp,
            purpose: 'login',
            userData: {
                userId: user._id,
                role: user.role
            }
        });
        await otpRecord.save();

        await sendLoginOTP(email, otp, user.name);

        res.json({
            success: true,
            message: "New OTP sent to your email"
        });

    } catch (error) {
        console.error("Resend Login OTP Error:", error);
        res.status(500).json({
            success: false,
            errors: "Failed to resend OTP"
        });
    }
});

/* ========== FORGET PASSWORD FLOW ========== */

// Request password reset OTP
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                errors: "Email is required"
            });
        }

        const user = await Users.findOne({ email: email });
        if (!user) {
            return res.status(404).json({
                success: false,
                errors: "No account found with this email address"
            });
        }

        const otp = generateOTP();

        await OTP.deleteMany({ email: email, purpose: 'password_reset' });

        const otpRecord = new OTP({
            email: email,
            otp: otp,
            purpose: 'password_reset',
            userData: {
                userId: user._id
            }
        });
        await otpRecord.save();

        await sendPasswordResetOTP(email, otp, user.name);

        res.json({
            success: true,
            message: "Password reset OTP sent to your email",
            email: email
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({
            success: false,
            errors: "Failed to send password reset OTP. Please try again."
        });
    }
});

// Resend password reset OTP
router.post('/resend-password-otp', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await Users.findOne({ email: email });
        if (!user) {
            return res.status(404).json({
                success: false,
                errors: "User not found"
            });
        }

        await OTP.deleteMany({ email: email, purpose: 'password_reset' });

        const otp = generateOTP();

        const otpRecord = new OTP({
            email: email,
            otp: otp,
            purpose: 'password_reset',
            userData: {
                userId: user._id
            }
        });
        await otpRecord.save();

        await sendPasswordResetOTP(email, otp, user.name);

        res.json({
            success: true,
            message: "New OTP sent to your email"
        });

    } catch (error) {
        console.error("Resend Password OTP Error:", error);
        res.status(500).json({
            success: false,
            errors: "Failed to resend OTP"
        });
    }
});

// Verify OTP and reset password
router.post('/reset-password', verifyOTP, async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                errors: "Password must be at least 6 characters long"
            });
        }

        const otpRecord = await OTP.findOne({ email: email, purpose: 'password_reset' });
        if (!otpRecord || !otpRecord.userData) {
            return res.status(400).json({
                success: false,
                errors: "Invalid request. Please request OTP again."
            });
        }

        const { userId } = otpRecord.userData;

        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                errors: "User not found"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await Users.findByIdAndUpdate(user._id, { password: hashedPassword });

        const activityLog = new ActivityLog({
            action: 'Password reset',
            type: 'user',
            userId: user._id,
            userName: user.name,
            details: { email: email }
        });
        await activityLog.save();

        await sendPasswordResetSuccess(email, user.name);
        await OTP.deleteMany({ email: email, purpose: 'password_reset' });

        res.json({
            success: true,
            message: "Password reset successful! Please login with your new password."
        });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({
            success: false,
            errors: "Failed to reset password. Please try again."
        });
    }
});

/* GET USER */

router.post('/getuser', fetchUser, async (req, res) => {
    try {
        if (req.user.id === 'admin') {
            return res.json({
                name: 'Admin',
                email: 'admin@shop.com',
                role: 'admin'
            });
        }

        const user = await Users.findById(req.user.id);
        
        const userData = user.toObject();
        delete userData.password;
        
        res.json(userData);
    } catch (error) {
        console.error("Get User Error:", error);
        res.status(500).json({
            success: false,
            errors: "Failed to fetch user data"
        });
    }
});

module.exports = router;