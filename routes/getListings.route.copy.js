const express = require('express');
const Listing = require('../database/models/Listing');
const StorageListing = require('../database/models/StorageListing');
const TransportListing = require('../database/models/TransportListing');
const CropListing = require('../database/models/CropListing');
const ListingImage = require('../database/models/ListingImage');
const {getImage} = require('../utils/s3Client');
const {Op, Sequelize} = require('sequelize');
const User = require("../database/models/User");

const router = express.Router();

router.get('/:offset/:type/:sort/:city/:district/:price?/:keyword?/:limit?', async (req, res) => {
    try {
        const {offset, type, sort, city, district, price, keyword, limit} = req.params;

        const ordering = (sort === "latest" || !sort) ? ['createdAt', 'DESC'] : ['createdAt', 'ASC'];

        const priceOrdering = (type) => {
            switch (type) {
                case 'crop':
                    return [Sequelize.literal('`CropListing`.`price_per_kg`'), 'ASC'];
                case 'storage':
                    return [Sequelize.literal('`StorageListing`.`price_per_unit`'), 'ASC'];
                case 'transport':
                    return [Sequelize.literal('`TransportListing`.`price_per_km`'), 'ASC'];
                default:
                    return ordering;
            }
        };

        const whereClause = {
            listing_type: (type === "all" || !type) ? ["crop", "transport", "storage"] : type
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
            offset: parseInt(offset) * 8,
            limit: limit || 8,
            where: {
                ...whereClause,
                ...search,
            },
            order: [
                priceOrdering(type)
            ],
            include: [
                {
                    model: ListingImage,
                    required: false
                },
                {
                    model: StorageListing,
                    required: false
                },
                {
                    model: TransportListing,
                    required: false
                },
                {
                    model: CropListing,
                    required: false
                },
                {
                    model: User,
                    attributes: ['first_name', 'last_name', 'profile_pic', 'profile_type'],
                    required: false
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

module.exports = router;