const express = require('express');
const Listing = require('../database/models/Listing');
const ListingImage = require('../database/models/ListingImage');
const {Op} = require('sequelize');
const {getImage} = require('../utils/s3Client');

const router = express.Router();

/**
 * @route GET /:keyword?
 * @description Search for listings by keyword in title or description.
 * @param {string} [keyword] - The keyword to search for in the title or description.
 * @returns {Object} 200 - An array of listings matching the search criteria.
 * @returns {Object} 500 - An error message if the search fails.
 */
router.get('/:keyword?', async (req, res) => {
    try {
        const {keyword} = req.params;

        const results = await Listing.findAll({
            // Define the search criteria
            where: {
                [Op.or]: [ // Use the OR operator to search in either the title or description
                    {
                        title: {
                            [Op.substring]: keyword // Search for the keyword in the title
                        }
                    }, {
                        description: {
                            [Op.substring]: keyword // Search for the keyword in the description
                        }
                    }]
            }, limit: 5, // Limit the number of results to 5
            include: [{
                model: ListingImage, // Include associated ListingImage model
                attributes: ['image'] // Only include the 'image' attribute from ListingImage
            }]
        });

        res.status(200).json({
            status: "success", result: await Promise.all(results.map(async result => ({
                id: result.id,
                title: result.title,
                listing_type: result.listing_type,
                image: await getImage(result.ListingImages[0] ? result.ListingImages[0].image : null),
            })))
        });

    } catch (error) {
        res.status(500).json({
            status: "failed", message: error.message,
        });
    }
});

module.exports = router;