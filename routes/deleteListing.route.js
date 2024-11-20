const express = require('express');
const router = express.Router();
const {authenticate} = require("../middleware/auth");
const sequelize = require("../database/connection");
const Listing = require("../database/models/Listing");

router.delete('/:id', authenticate, async (req, res) => {
    try {

        const {id} = req.params;

        const result = await sequelize.transaction(async () => {
            await Listing.destroy({
                where: {
                    id: id,
                }
            });
            return true;
        })

        res.status(200).json({
            status: 'success',
        });
    }
    catch (error) {
        res.status(400).json({
            status: 'failed!',
            message: error.message,
        });
    }
});

module.exports = router;