const express = require("express");
const router = express.Router();
const User = require("../database/models/User");
const { authenticate } = require("../middleware/auth");
const sequelize = require("../database/connection"); // Ensure sequelize is imported

// Fetch user distribution
router.get("/user-distribution", authenticate, async (req, res) => {
    try {
        const userDistribution = await User.findAll({
            attributes: [
                [sequelize.literal(`CASE WHEN user_role = 'admin' THEN 'admin' ELSE profile_type END`), 'profile_type'],
                [sequelize.fn("COUNT", sequelize.col("profile_type")), "count"]
            ],
            group: ["profile_type"]
        });

        res.status(200).json({
            status: "success",
            data: userDistribution
        });
    } catch (error) {
        console.error("Error fetching user distribution:", error); // Add logging
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

module.exports = router;