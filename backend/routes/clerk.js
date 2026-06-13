const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Users = require('../models/User');
const ActivityLog = require('../models/Activity');

const ADMIN_EMAIL = 'admin@shop.com';
const VALID_ROLES = ['customer', 'vendor'];

const resolveRole = (role) => {
    const normalized = typeof role === 'string' ? role.toLowerCase().trim() : '';
    return VALID_ROLES.includes(normalized) ? normalized : 'customer';
};

router.post('/sync-user', async (req, res) => {
    try {
        const { clerkId, name, email, role, isNewSignup } = req.body;

        console.log('Clerk sync request:', { clerkId, email, role, isNewSignup });

        if (!clerkId || !email) {
            return res.status(400).json({
                success: false,
                message: 'clerkId and email are required'
            });
        }

        const signupRole = resolveRole(role);

        if (email === ADMIN_EMAIL) {
            const token = jwt.sign(
                { user: { id: 'admin' } },
                process.env.JWT_SECRET
            );

            return res.json({
                success: true,
                token,
                role: 'admin',
                user: {
                    name: 'Admin',
                    email: ADMIN_EMAIL,
                    role: 'admin'
                }
            });
        }

        let user = await Users.findOne({ clerkId });
        let isNewUser = false;

        if (!user) {
            user = await Users.findOne({ email });

            if (user) {
                const isFirstClerkLink = !user.clerkId;
                user.clerkId = clerkId;
                if (name && !user.name) user.name = name;
                if (isNewSignup && isFirstClerkLink) {
                    user.role = signupRole;
                }
                await user.save();
            } else {
                isNewUser = true;
                const cart = {};
                for (let i = 0; i < 300; i++) {
                    cart[i] = 0;
                }

                user = new Users({
                    clerkId,
                    name: name || email.split('@')[0],
                    email,
                    cartData: cart,
                    role: signupRole
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
            }
        } else if (isNewSignup) {
            user.role = signupRole;
            await user.save();
        }

        console.log('Clerk sync saved user:', { email: user.email, role: user.role, isNewUser });

        const token = jwt.sign(
            { user: { id: user._id } },
            process.env.JWT_SECRET
        );

        const userData = user.toObject();
        delete userData.password;

        res.json({
            success: true,
            token,
            role: user.role,
            user: userData
        });
    } catch (error) {
        console.error('Clerk sync error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync user'
        });
    }
});

module.exports = router;
