const express = require('express');
const {authorize, authenticate} = require("../middleware/auth");

const router = express.Router();

router.post('/admin', authenticate, authorize('admin'), (req, res) => {
    try {
        res.status(200).json({
            status: "success",
            admin: `${req.user.first_name} ${req.user.last_name}`,
            message: "admin authenticated successfully!"
        })
    } catch (error) {
        res.status(403).json({
            status: "failed",
            message: `failed to authenticate user: ${error.message}`
        })
    }
})

module.exports = router;