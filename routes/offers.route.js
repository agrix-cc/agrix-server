const express = require('express');
const Listing = require("../database/models/Listing");
const CropListing = require("../database/models/CropListing");
const Offer = require("../database/models/Offer");
const ListingImage = require("../database/models/ListingImage");
const WantedListing = require("../database/models/WantedListing");
const {authenticate} = require("../middleware/auth");
const {getImage} = require("../utils/s3Client");
const {Op} = require("sequelize");

const router = express.Router();

router.get('/all', authenticate, async (req, res) => {
    try {
        const offers = await Offer.findAll({
            where: {
                [Op.or]: [
                    {offered_to: req.user.id},
                    {'$wanted_listing.UserId$': req.user.id}
                ]
            },
            include: [
                {
                    model: Listing,
                    as: 'wanted_listing',
                    include: [WantedListing]
                },
                {
                    model: Listing,
                    as: 'offered_listing',
                    include: CropListing
                }
            ]
        });

        res.status(200).json({
            status: "success",
            offers: offers,
        });
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

router.post('/send', authenticate, async (req, res) => {
    try {
        const {
            offered_price,
            offered_qty,
            offered_listing,
            wanted_listing,
            offered_to
        } = req.body;

        const [offer, created] = await Offer.findOrCreate({
            where: {
                offered_listing_id: offered_listing,
                ...(wanted_listing ? {wanted_listing_id: wanted_listing} : {offered_to: offered_to})
            },
            defaults: {
                wanted_listing_id: wanted_listing,
                offered_price: offered_price,
                offered_qty: offered_qty,
                offered_to: offered_to,
            }
        });

        if (!created) {
            offer.set({
                offered_price: offered_price,
                offered_qty: offered_qty
            });
            await offer.save();
        }

        res.status(200).json({
            status: "success",
            offer_id: offer.id,
        });
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

router.get('/load-listings', authenticate, async (req, res) => {
    try {
        const user = req.user;

        const listings = await Listing.findAll({
            where: {
                UserId: user.id
            },
            include: [
                {
                    model: CropListing,
                },
                {
                    model: ListingImage,
                    attributes: ["image"]
                }
            ]
        });

        const sendResponse = await Promise.all(listings.map(async listing => ({
            listing: listing,
            listing_image: listing.ListingImages[0]?.image ? await getImage(listing.ListingImages[0]?.image) : null,
        })));

        res.status(200).json({
            status: "success",
            listings: sendResponse,
        });
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});


router.delete('/:id', authenticate, async (req, res) => {
    try {
        const offerId = req.params.id;
        const offer = await Offer.findByPk(offerId);

        if (!offer) {
            return res.status(404).json({
                status: "failed",
                message: "Offer not found",
            });
        }

        await offer.destroy();

        res.status(200).json({
            status: "success",
            message: "Offer deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

module.exports = router;