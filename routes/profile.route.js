const express = require('express');
const User = require('../database/models/User');
const sequelize = require('../database/connection');
const {uploadProfilePic, getImage} = require('../utils/s3Client');
const {authenticate} = require("../middleware/auth");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

router.put('/edit', authenticate, upload.single('image'), async (req, res) => {
    try {
        const formData = req.body;
        const newUser = JSON.parse(formData.newUser);

        const results = await sequelize.transaction(async () => {
            const user = await User.findByPk(req.user.id);
            user.set(newUser);
            await user.save();

            if (req.file) {
                await uploadProfilePic(req.file, user);
            }

            return user;
        });

        const image = await getImage(results.profile_pic);
        const user = {...results.dataValues, image: image};

        const token = await jwt.sign({user}, JWT_SECRET_KEY, {expiresIn: '1h'});

        res.status(200).json({
            status: "success",
            result: token
        });

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

module.exports = router;