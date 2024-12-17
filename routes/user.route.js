const express = require("express");
const router = express.Router();
const Connection = require("../database/models/Connection");
const User = require("../database/models/User");
const {authenticate} = require("../middleware/auth");
const {Op} = require("sequelize");
const {getImage} = require("../utils/s3Client");

// Fetch users for "Get Connected"
router.get("/", authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all users not already connected
        const existingConnections = await Connection.findAll({
            where: {
                [Op.or]: [
                    {user_id: userId},
                    {connected_user_id: userId},
                ],
            },
        });

        const excludedUserIds = existingConnections.map((conn) =>
            conn.user_id === userId ? conn.connected_user_id : conn.user_id
        );

        const users = await User.findAll({
            where: {
                id: {
                    [Op.and]: [
                        {[Op.ne]: userId},
                        {[Op.notIn]: excludedUserIds},
                    ],
                },
            },
            attributes: ["id", "first_name", "last_name", "profile_type", "profile_pic"],
        });

        const responceUsers = await Promise.all(users.map(async user => ({
            image_url: user.profile_pic ? await getImage(user.profile_pic) : null,
            ...user.dataValues
        })));


        res.json({users: responceUsers});
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({message: "Error fetching users"});
    }
});

// Fetch sent connection requests
router.get("/sent", authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        const sentRequests = await Connection.findAll({
            where: {user_id: userId, status: "pending"},
            include: [
                {
                    model: User,
                    as: "connectedUser",
                    attributes: ["id", "first_name", "last_name", "profile_type", "profile_pic"],
                },
            ],
        });

        const formattedRequests = await Promise.all(sentRequests.map(async (req) => ({
            id: req.connectedUser.id,
            first_name: req.connectedUser.first_name,
            last_name: req.connectedUser.last_name,
            profile_type: req.connectedUser.profile_type,
            profile_pic: await getImage(req.connectedUser.profile_pic),
        })));

        res.json({requests: formattedRequests});
    } catch (error) {
        console.error("Error fetching sent requests:", error);
        res.status(500).json({message: "Error fetching sent requests"});
    }
});

// Fetch received connection requests
router.get("/received", authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        const receivedRequests = await Connection.findAll({
            where: {connected_user_id: userId, status: "pending"},
            include: [
                {
                    model: User,
                    as: "requestingUser",
                    attributes: ["id", "first_name", "last_name", "profile_type", "profile_pic"],
                },
            ],
        });

        const formattedRequests = await Promise.all(receivedRequests.map(async (req) => ({
            id: req.requestingUser.id,
            first_name: req.requestingUser.first_name,
            last_name: req.requestingUser.last_name,
            profile_type: req.requestingUser.profile_type,
            profile_pic: await getImage(req.requestingUser.profile_pic),
        })));

        res.json({requests: formattedRequests});
    } catch (error) {
        console.error("Error fetching received requests:", error);
        res.status(500).json({message: "Error fetching received requests"});
    }
});

// Send a connection request
router.post("/request", authenticate, async (req, res) => {
    try {
        const { connectedUserId } = req.body;
        const userId = req.user.id;

        if (!connectedUserId) {
            return res.status(400).json({ message: "Connected user ID is required" });
        }

        // Check if a connection already exists
        const existingConnection = await Connection.findOne({
            where: {
                [Op.or]: [
                    { user_id: userId, connected_user_id: connectedUserId },
                    { user_id: connectedUserId, connected_user_id: userId },
                ],
            },
        });

        if (existingConnection) {
            return res.status(400).json({ message: "Connection already exists" });
        }

        await Connection.create({
            user_id: userId,
            connected_user_id: connectedUserId,
            status: "pending",
        });

        res.status(201).json({ message: "Connection request sent" });
    } catch (error) {
        console.error("Error sending connection request:", error);
        res.status(500).json({ message: error.message });
    }
});

// Undo a connection request
router.post("/:userId/undo", authenticate, async (req, res) => {
    try {
        const {userId} = req.params;
        const currentUserId = req.user.id;

        await Connection.destroy({
            where: {
                user_id: currentUserId,
                connected_user_id: userId,
                status: "pending",
            },
        });

        res.status(200).json({message: "Connection request undone"});
    } catch (error) {
        console.error("Error undoing connection request:", error);
        res.status(500).json({message: "Error undoing connection request"});
    }
});

// Accept a connection request
router.post("/accept", authenticate, async (req, res) => {
    try {
        const { userId } = req.body;
        const currentUserId = req.user.id;

        await Connection.update(
            { status: "accepted" },
            {
                where: {
                    user_id: userId,
                    connected_user_id: currentUserId,
                    status: "pending",
                },
            }
        );

        res.status(200).json({ message: "Connection accepted" });
    } catch (error) {
        console.error("Error accepting connection request:", error);
        res.status(500).json({ message: "Error accepting connection request" });
    }
});

// Reject a connection request
router.post("/reject", authenticate, async (req, res) => {
    try {
        const {userId} = req.body;
        const currentUserId = req.user.id;

        await Connection.update(
            {status: "rejected"},
            {
                where: {
                    user_id: userId,
                    connected_user_id: currentUserId,
                    status: "pending",
                },
            }
        );

        res.status(200).json({message: "Connection rejected"});
    } catch (error) {
        console.error("Error rejecting connection request:", error);
        res.status(500).json({message: "Error rejecting connection request"});
    }
});

// Fetch accepted connections
router.get("/connections", authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        const connections = await Connection.findAll({
            where: {
                status: "accepted",
                [Op.or]: [
                    {user_id: userId},
                    {connected_user_id: userId},
                ],
            },
            include: [
                {
                    model: User,
                    as: "requestingUser",
                    attributes: ["id", "first_name", "last_name", "profile_type", "profile_pic"],
                },
                {
                    model: User,
                    as: "connectedUser",
                    attributes: ["id", "first_name", "last_name", "profile_type", "profile_pic"],
                },
            ],
        });

        const formattedConnections = await Promise.all(connections.map(async (conn) => {
            const isRequester = conn.user_id === userId;
            const connectedUser = isRequester ? conn.connectedUser : conn.requestingUser;
            return {
                id: connectedUser.id,
                first_name: connectedUser.first_name,
                last_name: connectedUser.last_name,
                profile_type: connectedUser.profile_type,
                profile_pic: await getImage(connectedUser.profile_pic),
            };
        }));

        res.json({connections: formattedConnections});
    } catch (error) {
        console.error("Error fetching connections:", error);
        res.status(500).json({message: "Error fetching connections"});
    }
});

// Remove a connection
router.delete("/:userId/remove", authenticate, async (req, res) => {
    try {
        const {userId} = req.params;
        const currentUserId = req.user.id;

        // Delete the connection
        await Connection.destroy({
            where: {
                status: "accepted",
                [Op.or]: [
                    {user_id: currentUserId, connected_user_id: userId},
                    {user_id: userId, connected_user_id: currentUserId},
                ],
            },
        });

        res.status(200).json({message: "Connection removed successfully"});
    } catch (error) {
        console.error("Error removing connection:", error);
        res.status(500).json({message: "Error removing connection"});
    }
});

router.get("/status/:userId", authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        const connection = await Connection.findOne({
            where: {
                [Op.or]: [
                    { user_id: currentUserId, connected_user_id: userId },
                    { user_id: userId, connected_user_id: currentUserId },
                ],
            },
        });

        if (!connection) {
            return res.json({ status: null });
        }

        res.json({ status: connection.status });
    } catch (error) {
        console.error("Error fetching connection status:", error);
        res.status(500).json({ message: "Error fetching connection status" });
    }
});

module.exports = router;
