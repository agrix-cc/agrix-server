const express = require('express');
const Listing = require('../database/models/Listing');
const ListingImage = require('../database/models/ListingImage');
const {Op} = require('sequelize');
const {getImage} = require('../utils/s3Client');

const router = express.Router();

router.get('/:keyword?', async (req, res) => {
    try {

        const {keyword} = req.params;

        const results = await Listing.findAll({
            where: {
                [Op.or]: [
                    {
                        title: {
                            [Op.substring]: keyword
                        }
                    },
                    {
                        description: {
                            [Op.substring]: keyword
                        }
                    }
                ]
            },
            limit: 5,
            include: [{
                model: ListingImage,
                attributes: ['image']
            }]
        });

        res.status(200).json({
            status: "success",
            result: await Promise.all(results.map(async result => ({
                id: result.id,
                title: result.title,
                listing_type: result.listing_type,
                image: await getImage(result.ListingImages[0] ? result.ListingImages[0].image : null),
            })))
        });

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

module.exports = router;