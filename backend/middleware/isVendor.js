const Users = require('../models/User');

const isVendor = async (req, res, next) => {

    if (req.user.id === 'admin') {
        return next();
    }

    const user = await Users.findById(req.user.id);

    if (
        !user ||
        (
            user.role !== 'vendor' &&
            user.role !== 'admin'
        )
    ) {

        return res.status(403).json({
            success: false,
            errors: "Vendor access required"
        });
    }

    next();
};

module.exports = isVendor;