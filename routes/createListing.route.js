const express = require('express');
const multer = require('multer');
const Listing = require('../database/models/Listing');
const User = require('../database/models/User');
const StorageListing = require('../database/models/StorageListing');
const CropListing = require('../database/models/CropListing');
const TransportListing = require('../database/models/TransportListing');
const {authenticate} = require("../middleware/auth");
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({storage: storage});

router.post('/', authenticate, upload.array('images'), async (req, res) => {
    try {
        const formData = req.body;
        const listingInfo = JSON.parse(formData.listingInfo);

        const newListing = await Listing.create(listingInfo);
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
                const newCropListing = await CropListing.create(cropInfo);
                await newListing.setCropListing(newCropListing);

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