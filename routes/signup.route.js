const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../database/models/User');

require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const {first_name, last_name, email, password, profile_type} = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({first_name, last_name, email, password: hashedPassword, profile_type});

        const token = await jwt.sign({user}, JWT_SECRET_KEY, {expiresIn: '1h'});

        res.status(200).json({
            status: 'success',
            message: 'User registered successfully!',
            token: token,
        });

    } catch (error) {
        // if (error.original.errno === 1062) {
        //     res.status(409).json({
        //         status: 'duplicate',
        //         message: `User already registered!: ${error.message}`,
        //     });
        // } else {
        //
        // }
        res.status(404).json({
            status: 'failed',
            message: error,
        });
    }
});

module.exports = router;