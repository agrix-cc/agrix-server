const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../database/models/User');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const {first_name, last_name, email, password, profile_type} = req.body;

        console.log("Received signup request:", req.body); // Log the request data

        const existingUser = await User.findOne({where: {email: email}});

        if (existingUser) {
            res.status(400).json({
                status: 'failed',
                message: 'You have already registered in the system!',
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({first_name, last_name, email, password: hashedPassword, profile_type});

        const token = await jwt.sign({user: {...user.dataValues, image: null}}, JWT_SECRET_KEY, {expiresIn: '1h'});

        // res.status(200).json({
        //     status: 'success',
        //     message: 'User registered successfully!',
        //     token: token,
        // });
        res.status(200).json({
            status: 'success',
            message: profile_type,
            token: token,
        });

    } catch (error) {
        console.error("Error during signup:", error); // Log the error
        res.status(404).json({
            status: 'failed',
            message: error.message,
        });
    }
});

module.exports = router;