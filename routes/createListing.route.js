const express = require('express');
const multer = require('multer');
const Listing = require('../database/models/Listing');
const User = require('../database/models/User');
const StorageListing = require('../database/models/StorageListing');
const CropListing = require('../database/models/CropListing');
const TransportListing = require('../database/models/TransportListing');
const ListingImage = require('../database/models/ListingImage');
const {authenticate} = require("../middleware/auth");
const {v4} = require('uuid');
const {S3Client, PutObjectCommand} = require("@aws-sdk/client-s3");
const {extname} = require("node:path");
const router = express.Router();

require('dotenv').config();

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const awsAccessKey = process.env.AWS_ACCESS_KEY;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsRegion = process.env.AWS_REGION;
const awsBucketName = process.env.AWS_BUCKET_NAME;

const s3 = new S3Client({
    credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretAccessKey,
    },
    region: awsRegion,
});

const uploadFileToS3 = async (file, newListing) => {
    const imageName = `${v4()}${extname(file.originalname)}`;
    const params = {
        Bucket: awsBucketName,
        Key: imageName,
        Body: file.buffer,
        ContentType: file.mimeType,
    }

    const command = new PutObjectCommand(params);

    await s3.send(command);
    const newImage = await ListingImage.create({image: imageName});
    await newListing.addListingImage(newImage);
}

router.post('/', authenticate, upload.array('images'), async (req, res) => {
    try {

        const formData = req.body;
        const listingInfo = JSON.parse(formData.listingInfo);
        const newListing = await Listing.create(listingInfo);

        req.files.forEach(file => {
            uploadFileToS3(file, newListing);
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