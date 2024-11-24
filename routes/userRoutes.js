const express = require('express');
const router = express.Router();
const User = require('../database/models/User'); // Assuming User is your model
const { authenticate } = require('../middleware/auth');
const { Op } = require('sequelize');

router.get('/', authenticate, async (req, res) => {
    try {
        const user = req.user;

        const page = parseInt(req.query.page) || 1;
        const limit = 16; // Number of users per page
        const offset = (page - 1) * limit;

        // Test query
        const result = await User.findAndCountAll({
            attributes: ['id', 'first_name', 'last_name', 'profile_pic', 'bio'], // Fetch specific fields
            where: {
                id: {
                    [Op.ne]: user.id// Exclude the current user
                }
            },
            limit: limit,
            offset: offset
        });

        // console.log('Fetched users:', result.rows);

        res.json({
            users: result.rows,
            totalPages: Math.ceil(result.count / limit),
        });

    } catch (error) {
        //console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

module.exports = router;