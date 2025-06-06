const express = require('express');
const Listing = require('../database/models/Listing');
const StorageListing = require('../database/models/StorageListing');
const TransportListing = require('../database/models/TransportListing');
const WantedListing = require('../database/models/WantedListing');
const CropListing = require('../database/models/CropListing');
const ListingImage = require('../database/models/ListingImage');
const {getImage} = require('../utils/s3Client');
const {Op} = require('sequelize');
const User = require("../database/models/User");
const {authenticate} = require("../middleware/auth");

const router = express.Router();

router.get('/:offset/:type/:sort/:city/:district/:keyword?/:limit?', async (req, res) => {
    try {
        const {offset, type, sort, city, district, keyword, limit} = req.params;

        const ordering = (sort === "latest" || !sort) ? ['createdAt', 'DESC'] : ['createdAt', 'ASC'];

        const whereClause = {
            listing_type: (type === "all" || !type) ? ["crop", "transport", "storage", "wanted"] : type
        };

        if ((city !== "all") || !city) {
            whereClause.city = city;
        }

        if ((district !== "all") || !district) {
            whereClause.district = district;
        }

        const search = keyword ? {
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
        } : null;

        const listings = await Listing.findAndCountAll({
            where: {
                ...whereClause,
                ...search,
            },
            order: [
                ordering,
            ],
            include: [
                ListingImage,
                StorageListing,
                TransportListing,
                WantedListing,
                CropListing,
                {
                    model: User,
                    attributes: ['first_name', 'last_name', 'profile_pic', 'profile_type']
                },
            ],
        });

        const responseListings = await Promise.all(listings.rows.map(async listing => ({
            id: listing.id,
            title: listing.title,
            description: listing.description,
            crop: listing.CropListing,
            storage: listing.StorageListing,
            transport: listing.TransportListing,
            wantedListing: listing.WantedListing,
            imageUrl: listing.ListingImages[0] ? await getImage(listing.ListingImages[0].image) : null,
            listing_type: listing.listing_type,
            user: listing.User,
            city: listing.city,
            district: listing.district,
        })));

        res.status(200).json({
            status: "success",
            listings: responseListings,
            count: listings.count,
            end: listings.rows.length < 8,
        });

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

router.get('/user', authenticate, async (req, res) => {
    try {

        const user = req.user;

        const listings = await Listing.findAll({
            where: {userId: user.id},
            include: [
                CropListing,
                StorageListing,
                TransportListing,
            ]
        })

        res.status(200).json({
            status: "success",
            listings: listings,
        });

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

router.get('/latest', async (req, res) => {
    try {
        const listings = await Listing.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [
                ListingImage,
                StorageListing,
                TransportListing,
                WantedListing,
                CropListing,
                {
                    model: User,
                    attributes: ['first_name', 'last_name', 'profile_pic', 'profile_type']
                },
            ],
        })

        const responseListings = await Promise.all(listings.map(async listing => ({
            id: listing.id,
            title: listing.title,
            description: listing.description,
            crop: listing.CropListing,
            storage: listing.StorageListing,
            transport: listing.TransportListing,
            wantedListing: listing.WantedListing,
            images: listing.ListingImages ? await Promise.all(listing.ListingImages.map(async item => await getImage(item.image))) : null,
            listing_type: listing.listing_type,
            user: listing.User,
            userImage: listing.User.profile_pic ? await getImage(listing.User.profile_pic) : null,
            city: listing.city,
            district: listing.district,
        })));

        res.status(200).json({
            status: "success",
            listings: responseListings,
        });

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
})

router.get('/transport', async (req, res) => {
    try {
        const transportListings = await Listing.findAll({
            where: {
                listing_type: "transport"
            },
            include: [
                TransportListing,
                {
                    model: ListingImage,
                    attributes: ['image'],
                    limit: 1,
                },
            ]
        })

        const listingInfo = await Promise.all(transportListings.map(async (listing) => ({
            imageUrl: await getImage(listing.ListingImages[0].image),
            listing
        })));

        res.status(200).json({
            status: "success",
            listings: listingInfo,
        })

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }

})

module.exports = router;