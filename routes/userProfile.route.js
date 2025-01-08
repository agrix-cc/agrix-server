const express = require("express");
const router = express.Router();
const User = require("../database/models/User");
const Listing = require("../database/models/Listing"); // Assuming a Listing model exists
const {authenticate} = require("../middleware/auth");
const {getImage} = require("../utils/s3Client");
const {Op} = require("sequelize");
const sq = require("../database/connection");

// Fetch user profile and their listings
router.get("/:userId", authenticate, async (req, res) => {
    try {
        const {userId} = req.params;

        // Fetch the user's profile details
        const user = await User.findByPk(userId, {
            attributes: ["id", "first_name", "last_name", "profile_pic", "bio", "profile_type", "city", "district"],
        });

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        // Fetch the user's listings
        const listings = await Listing.findAll({
            // TODO FIX user profile view
            // see the database before referring column names here
            // Listings tables user_id is not exists it is UserId
            where: {UserId: userId},
            attributes: ["id", "title", "description", "createdAt"],
        });

        const imageUrl = await getImage(user.profile_pic);

        // Return user data and listings
        res.status(200).json({
            user: {...user.dataValues, imageUrl: imageUrl},
            listings,
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({message: error.message});
    }
});

router.get('/', authenticate, async (req, res) => {
    try {
        const currentUserId = req.user.id;

        const users = await User.findAll({
            where: {
                id: {
                    [Op.ne]: currentUserId
                },
                [Op.or]: [
                    {id: {[Op.in]: sq.literal(`(SELECT sender_id FROM Messages WHERE receiver_id = ${currentUserId})`)}},
                    {id: {[Op.in]: sq.literal(`(SELECT receiver_id FROM Messages WHERE sender_id = ${currentUserId})`)}}
                ]
            }
        });

        res.status(200).send({
            status: "success",
            data: users
        });

    } catch (error) {
        res.status(500).send({
            message: "failed",
            data: error
        });
    }
})

router.get('/search/:name', authenticate, async (req, res) => {
    try {

        const {name} = req.params;

        const users = await User.findAll({
            where: {
                id: {
                    [Op.ne]: req.user.id
                },
                [Op.or]: [
                    {first_name: {[Op.like]: `%${name}%`}},
                    {last_name: {[Op.like]: `%${name}%`}}
                ]
            }
        });

        res.status(200).send({
            status: "success",
            users: users
        })

    } catch (error) {
        res.status(500).send({
            message: "failed",
            data: error
        })
    }
})
module.exports = router;
