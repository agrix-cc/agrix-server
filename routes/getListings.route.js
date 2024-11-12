const express = require('express');
const Listing = require('../database/models/Listing');

const router = express.Router();

router.get('/:offset/:type/:sort/:city/:district', async (req, res) => {
    try {
        const {offset, type, sort, city, district} = req.params;

        const ordering = (sort === "latest" || !sort) ? ['createdAt', 'DESC'] : ['createdAt', 'ASC'];

        const whereClause = {
            listing_type: (type === "all" || !type) ? ["crop", "transport", "storage"] : type
        };

        if ((city !== "all") || !city) {
            whereClause.city = city;
        }

        if ((district !== "all") || !district) {
            whereClause.district = district;
        }

        const listings = await Listing.findAll({
            offset: parseInt(offset) || 0,
            limit: 16,
            where: whereClause,
            order: [
                ordering,
            ],
        });

        res.status(200).json({
            status: "success",
            listings: listings,
            params: {offset, type, sort, city, district},
        });

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

module.exports = router;