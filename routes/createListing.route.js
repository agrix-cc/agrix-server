//agrix-server\routes\createListing.route.js
const express = require('express');
const multer = require('multer');
const Listing = require('../database/models/Listing');
const User = require('../database/models/User');
const StorageListing = require('../database/models/StorageListing');
const CropListing = require('../database/models/CropListing');
const TransportListing = require('../database/models/TransportListing');
const GeneralUserListing = require('../database/models/GeneralUserListing');
const {authenticate} = require("../middleware/auth");
const {uploadListingImage} = require("../utils/s3Client");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

/**
 * Route to create a new listing.
 * @route POST /
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing form data.
 * @param {Array} req.files - The array of image files uploaded.
 * @param {Object} res - The response object.
 * @returns {Object} - A JSON object indicating the status of the operation.
 */
router.post('/', authenticate, upload.array('images'), async (req, res) => {
    try {
        const formData = req.body;
        const listingInfo = JSON.parse(formData.listingInfo);

        const newListing = await Listing.create(listingInfo);

        req.files.forEach(file => {
            uploadListingImage(file, newListing);
        });

        // Create relationship with user by adding user id
        const user = await User.findByPk(req.user.id);
        await user.addListing(newListing);

        switch (listingInfo.listing_type) {
            case "storage":
                const storageInfo = JSON.parse(formData.storageInfo);
                const newStorageListing = await StorageListing.create(storageInfo);
                await newListing.setStorageListing(newStorageListing);

                res.status(200).json({
                    status: "success",
                    message: "Listing submitted successfully!",
                });
                break;

            case "transport":
                const transportInfo = JSON.parse(formData.transportInfo);
                const newTransportListing = await TransportListing.create(transportInfo);
                await newListing.setTransportListing(newTransportListing);

                res.status(200).json({
                    status: "success",
                    message: "Listing submitted successfully!",
                });
                break;

            case "crop":
                const cropInfo = JSON.parse(formData.cropInfo);
                const bestBeforeDate = new Date(cropInfo.best_before_date);
                const currentDate = new Date();
                if (currentDate > bestBeforeDate) {
                    cropInfo.is_flash_sale = true;
                    cropInfo.discounted_price = cropInfo.price_per_kg * 0.8;
                }
                const newCropListing = await CropListing.create(cropInfo);
                await newListing.setCropListing(newCropListing);

                res.status(200).json({
                    status: "success",
                    message: "Listing submitted successfully!",
                });
                break;
            case "generaluser":
                const wantedListing = JSON.parse(formData.generaluserInfo);
                const newWantedListing = await GeneralUserListing.create(wantedListing);
                await newListing.setGeneralUserListing(newWantedListing);

                res.status(200).json({
                    status: "success",
                    message: "Listing submitted successfully!",
                });
                break;

            default:
                res.status(400).json({
                    status: "failed",
                    message: "Unidentified listing type!",
                });
                break;
        }
    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: error.message,
        })
    }
});

module.exports = router;