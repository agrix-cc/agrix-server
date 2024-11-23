const express = require('express');
const router = express.Router();
const User = require('../database/models/User'); // Import User model

// API Endpoint: Fetch Random Users with Pagination
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 16 } = req.query; // Get page and limit from query
        const offset = (page - 1) * limit;

        // Fetch random users with limit and offset
        const users = await User.findAll({
            attributes: ['first_name', 'last_name', 'profile_pic', 'profile_type'],
            order: sequelize.literal('RAND()'),
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.status(200).json({ users, page });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

module.exports = router;
