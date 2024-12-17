const express = require("express");
const router = express.Router();
const User = require("../database/models/User");
const { authenticate } = require("../middleware/auth");

// Fetch all users
router.get("/users", authenticate, async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json({
            status: "success",
            users: users,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

// Fetch a single user by ID
router.get("/users/:id", authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({
                status: "failed",
                message: "User not found",
            });
        }
        res.status(200).json({
            status: "success",
            user: user,
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

// Update user information
router.put("/users/:id", authenticate, async (req, res) => {
    try {
        const { firstName, lastName, email, profileType, address, city, district, contactNumber } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({
                status: "failed",
                message: "User not found",
            });
        }
        user.first_name = firstName;
        user.last_name = lastName;
        user.email = email;
        user.profile_type = profileType;
        user.address = address;
        user.city = city;
        user.district = district;
        user.contact_number = contactNumber;
        await user.save();
        res.status(200).json({
            status: "success",
            message: "User updated successfully",
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

module.exports = router;