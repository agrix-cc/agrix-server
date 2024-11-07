const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../database/models/User');

require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({where: {email: email}});

        if (!user) {
            return res.status(404).json({
                status: 'failed',
                message: 'Invalid email or password!',
            });
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);

        if (!isPasswordMatched) {
            return res.status(404).json({
                status: 'failed',
                message: 'Invalid email or password!'
            });
        }

        const token = await jwt.sign({user}, JWT_SECRET_KEY, {expiresIn: '1h'});

        res.status(200).json({
            status: 'success',
            message: 'sign in success',
            token: token,
        });

    } catch (error) {
        res.status(404).json({
            status: 'failed',
            message: error.message,
        })
    }

});

module.exports = router;