const Users = require('../models/User');

const isAdmin = async (req, res, next) => {

    if (req.user.id === 'admin') {
        return next();
    }

    const user = await Users.findById(req.user.id);

    if (!user || user.role !== 'admin') {

        return res.status(403).json({
            success: false,
            errors: "Admin access required"
        });
    }

    next();
};

module.exports = isAdmin;