const jwt = require('jsonwebtoken');
const User = require('../database/models/User');

require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authenticate = async (req, res, next) => {
    const token = req.headers('Authentication')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            status: 'unauthorized',
            message: 'Authentication required!'
        });
    }

    try {
        const decoded = jwt.decode(token, JWT_SECRET_KEY);

        const user = await User.findByPk(decoded.id);

        if (!user) {
            throw new Error('User not found!');
        }

        req.user = user;
        next();

    } catch (error) {
        res.status(403).json({
            status: 'forbidden',
            message: `You must register to the system!: ${error.message}`
        });
    }
};

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