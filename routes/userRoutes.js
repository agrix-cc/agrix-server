const express = require('express');
const router = express.Router();
const User = require('../database/models/User'); // Assuming User is your model

// Route to fetch users with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 16; // 16 users per page
        const offset = (page - 1) * limit;

        const { rows: users, count } = await User.findAndCountAll({
            offset,
            limit,
        });

        res.json({
            users,
            totalPages: Math.ceil(count / limit),
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

module.exports = router;