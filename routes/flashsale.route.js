const express = require('express');
const Listing = require('../database/models/Listing');
const ListingImage = require('../database/models/ListingImage');
const CropListing = require('../database/models/CropListing');
const { getImage } = require('../utils/s3Client');
const User = require("../database/models/User");
const {Op} = require("sequelize");
const router = express.Router();

router.get("",  async (req, res) => {
    try {
        const flashSaleListings = await Listing.findAll({
            where: { listing_type: 'crop' },
            include: [
                {
                    model: CropListing,
                    where: {
                        is_flash_sale: true,
                        best_before_date: {
                            [Op.gte]: new Date(new Date().setDate(new Date().getDate()))
                        }
                    },
                },
                ListingImage,
                {
                    model: User,
                    attributes: ['first_name', 'last_name', 'profile_pic', 'profile_type']
                },
            ],
        });

        const responseListings = await Promise.all(flashSaleListings.map(async listing => ({
            id: listing.id,
            title: listing.title,
            description: listing.description,
            crop: listing.CropListing,
            images: await Promise.all(listing.ListingImages.map(async image => await getImage(image.image))),
            user: listing.User,
            listingAllInfo: listing
        })));

        res.status(200).json({
            status: 'success',
            listings: responseListings,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'failed',
            message: error.message,
        });
    }
})

module.exports = router;