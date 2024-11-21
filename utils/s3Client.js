/**
 * @file s3Client.js
 * @description Utility functions for interacting with AWS S3, including getting signed URLs and uploading images.
 */

const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");
const {S3Client, GetObjectCommand, PutObjectCommand} = require("@aws-sdk/client-s3");
const {v4} = require("uuid");
const {extname} = require("node:path");
const ListingImage = require("../database/models/ListingImage");

const awsAccessKey = process.env.AWS_ACCESS_KEY;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsRegion = process.env.AWS_REGION;
const awsBucketName = process.env.AWS_BUCKET_NAME;

const client = new S3Client({
    credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretAccessKey,
    },
    region: awsRegion,
});

/**
 * Generates a signed URL for accessing an image in the S3 bucket.
 * @param {string} name - The name of the image file in the S3 bucket.
 * @returns {Promise<string|null>} - The signed URL or null if an error occurs.
 */
const getImage = async (name) => {
    const params = {
        Bucket: awsBucketName,
        Key: name,
    };

    const command = new GetObjectCommand(params);

    try {
        return await getSignedUrl(client, command, {expiresIn: 3600});
    } catch (error) {
        console.error("Error getting signed URL:", error);
        return null;
    }
};

/**
 * Uploads a listing image to the S3 bucket and associates it with a new listing.
 * @param {Object} file - The file object containing the image data.
 * @param {Object} newListing - The new listing object to associate the image with.
 * @returns {Promise<void>}
 */
const uploadListingImage = async (file, newListing) => {
    const imageName = `${v4()}${extname(file.originalname)}`;
    const params = {
        Bucket: awsBucketName,
        Key: imageName,
        Body: file.buffer,
        ContentType: file.mimeType,
    }

    const command = new PutObjectCommand(params);

    try {
        await client.send(command);
        const newImage = await ListingImage.create({image: imageName});
        await newListing.addListingImage(newImage);
    } catch (error) {
        console.error("Error getting signed URL:", error);
    }
}

/**
 * Uploads a profile picture to the S3 bucket and updates the user's profile picture.
 * @param {Object} file - The file object containing the image data.
 * @param {Object} user - The user object to update with the new profile picture.
 * @returns {Promise<void>}
 */
const uploadProfilePic = async (file, user) => {
    try {
        if (!user) return;
        const imageName = `${v4()}${extname(file.originalname)}`;
        const params = {
            Bucket: awsBucketName,
            Key: imageName,
            Body: file.buffer,
            ContentType: file.mimeType,
        }

        const command = new PutObjectCommand(params);

        await client.send(command);
        user.profile_pic = imageName;
        await user.save();
    } catch (error) {
        console.error("Error getting signed URL:", error);
    }
}

module.exports = {getImage, uploadListingImage, uploadProfilePic};