const express = require('express');
const router = express.Router();
const {authenticate} = require("../middleware/auth");
const sequelize = require("../database/connection");
const Listing = require("../database/models/Listing");

/**
 * Route to delete a listing by ID.
 * @route DELETE /:id
 * @param {Object} req - The request object.
 * @param {string} req.params.id - The ID of the listing to delete.
 * @param {Object} res - The response object.
 * @returns {Object} - A JSON object indicating the status of the operation.
 */
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
        });

        res.status(200).json({
            status: 'success',
        });
    } catch (error) {
        res.status(400).json({
            status: 'failed!',
            message: error.message,
        });
    }
});

module.exports = router;