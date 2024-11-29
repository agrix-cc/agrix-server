const express = require("express");
const router = express.Router();
const User = require("../database/models/User");
const Listing = require("../database/models/Listing"); // Assuming a Listing model exists
const { authenticate } = require("../middleware/auth");

// Fetch user profile and their listings
router.get("/:userId", authenticate, async (req, res) => {
    console.log("Hello from user profile route");
    try {
        const { userId } = req.params;

        // Fetch the user's profile details
        const user = await User.findByPk(userId, {
            attributes: ["id", "first_name", "last_name", "profile_pic", "bio", "profile_type", "city", "district"],
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch the user's listings
        const listings = await Listing.findAll({
            // TODO FIX user profile view
            // see the database before referring column names here
            // Listings tables user_id is not exists it is UserId
            where: { UserId: userId },
            attributes: ["id", "title", "description", "createdAt"],
        });

        // Return user data and listings
        res.status(200).json({ user, listings });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
