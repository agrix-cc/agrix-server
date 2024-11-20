const express = require('express');
const Listing = require('../database/models/Listing');
const StorageListing = require('../database/models/StorageListing');
const TransportListing = require('../database/models/TransportListing');
const CropListing = require('../database/models/CropListing');
const ListingImage = require('../database/models/ListingImage');
const User = require('../database/models/User');
const {getImage} = require('../utils/s3Client');
const TransportOrder = require("../database/models/TransportOrder");
const StorageOrder = require("../database/models/StorageOrder");
const {authenticate} = require("../middleware/auth");

const router = express.Router();

router.get('/:id?', async (req, res) => {
    try {
        const {id} = req.params;

        const listing = await Listing.findByPk(id, {
            include: [
                {
                    model: StorageListing,
                    include: [{
                        model: StorageOrder,
                        attributes: ['start_date', 'end_date']
                    }]
                },
                {
                    model: TransportListing,
                    include: [{
                        model: TransportOrder,
                        attributes: ['booked_date']
                    }]
                },
                CropListing,
                {
                    model: User,
                    attributes: ['first_name', 'last_name', 'profile_pic', 'profile_type']
                }
            ]
        });

        const images = await ListingImage.findAll({
            where: {
                ListingId: id,
            }
        });

        res.status(200).json({
            status: "success",
            listing: listing,
            images: await Promise.all(images.map(async image => (
                await getImage(image.image)
            ))),
        });

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

router.get('/edit/:id', authenticate, async (req, res) => {
    try {

        const {id} = req.params;

        const user = req.user;

        const listing = await Listing.findByPk(id, {
            include: [
                CropListing,
                TransportListing,
                StorageListing,
            ]
        });

        if (user.id !== listing.UserId) throw new Error("403 forbidden: You are not authenticated to edit this listing");

        res.status(200).json({
            status: "success",
            listing: listing
        });

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
})

module.exports = router;