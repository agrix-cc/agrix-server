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

router.post('/:id', authenticate, upload.array('images'), async (req, res) => {
    try {

        const {id} = req.params;

        const formData = req.body;
        const listingInfo = JSON.parse(formData.listingInfo);

        const result = await sequelize.transaction(async () => {
            const listing = await Listing.findByPk(id);
            await listing.update(listingInfo);

            if (req.files.length) {
                await ListingImage.destroy({
                    where: {
                      ListingId: id,
                    },
                });
                req.files.forEach(file => {
                    uploadListingImage(file, listing);
                });
            }

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