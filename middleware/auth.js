const jwt = require('jsonwebtoken');
const User = require('../database/models/User');
// Get generated JWT signature key
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
// This middleware is to authenticate users by getting the JWT payload from client side
const authenticate = async (req, res, next) => {
    // Authorization header sent from client side request
    const token = req.headers['authorization']?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            status: 'unauthorized',
            message: 'Authentication required!'
        });
    }

    try {
        // Decode the payload using secret key
        const decoded = await jwt.decode(token, JWT_SECRET_KEY);

        // Find user from the database
        const user = await User.findByPk(decoded.user.id);

        if (!user) {
            throw new Error('User not found!');
        }

        // assign user details to the request
        req.user = user;
        next();

    } catch (error) {
        res.status(403).json({
            status: 'forbidden',
            message: `You must register to the system!: ${error.message}`
        });
    }
};

// Authorize user role
const authorize = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.user_role === role) {
            next();
        } else {
            res.status(403).json({
                status: 'unauthorised',
                message: 'Access denied!'
            });
        }
    }
};




module.exports = {authenticate, authorize};