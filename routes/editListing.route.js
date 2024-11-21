const express = require('express');
const multer = require('multer');
const Listing = require('../database/models/Listing');
const sequelize = require('../database/connection');
const ListingImage = require('../database/models/ListingImage');
const StorageListing = require('../database/models/StorageListing');
const CropListing = require('../database/models/CropListing');
const TransportListing = require('../database/models/TransportListing');
const {authenticate} = require("../middleware/auth");
const {uploadListingImage} = require("../utils/s3Client");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

/**
 * Route to edit an existing listing by ID.
 * @route POST /:id
 * @param {Object} req - The request object.
 * @param {string} req.params.id - The ID of the listing to edit.
 * @param {Object} req.body - The request body containing form data.
 * @param {Array} req.files - The array of image files uploaded.
 * @param {Object} res - The response object.
 * @returns {Object} - A JSON object indicating the status of the operation.
 */
router.post('/:id', authenticate, upload.array('images'), async (req, res) => {
    try {
        // Get listing id from url parameters
        const {id} = req.params;

        const formData = req.body;
        // Convert form data listing information into json object
        const listingInfo = JSON.parse(formData.listingInfo);

        // Sequelize transaction
        const result = await sequelize.transaction(async () => {
            // find the listing by id
            const listing = await Listing.findByPk(id);
            // update listing with new information
            await listing.update(listingInfo);

            // add images if any received from the request
            if (req.files.length) {
                // remove old images and add new images
                await ListingImage.destroy({
                    where: {
                      ListingId: id,
                    },
                });
                req.files.forEach(file => {
                    uploadListingImage(file, listing);
                });
            }

            // Edit other relative listing informations in transport crop and storage with updated information

            let additionalInfo = {};
            if (listingInfo.listing_type === "crop") {
                additionalInfo = JSON.parse(formData.cropInfo);
                const crop = await CropListing.findOne({
                    where: {ListingId: id}
                });
                await crop.update(additionalInfo);
                return crop;
            }

            if (listingInfo.listing_type === "transport") {
                additionalInfo = JSON.parse(formData.transportInfo);
                const transport = await TransportListing.findOne({
                    where: {ListingId: id}
                });
                await transport.update(additionalInfo);
                return transport;
            }

            if (listingInfo.listing_type === "storage") {
                additionalInfo = JSON.parse(formData.storageInfo);
                const storage = await StorageListing.findOne({
                    where: {ListingId: id}
                });
                await storage.update(additionalInfo);
                return storage;
            }
            return null;
        })

        if (!result) throw new Error("Unidentified listing type!");

        res.status(200).json({
            message: "success",
            result: result,
        });

    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: error.message,
        })
    }
});

module.exports = router;