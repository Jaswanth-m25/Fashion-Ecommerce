const jwt = require('jsonwebtoken');

const fetchUser = async (req, res, next) => {

    const token = req.header('auth-token');

    if (!token) {

        return res.status(401).json({
            errors: "Please authenticate"
        });
    }

    try {

        const data = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = data.user;

        next();

    } catch (error) {

        return res.status(401).json({
            errors: "Invalid token"
        });
    }
};

module.exports = fetchUser;