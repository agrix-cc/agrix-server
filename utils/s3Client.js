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

const getImage = async (name) => {
    // TODO return null because everytime it get loads it eats my data
    // return null;
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

module.exports = {getImage, uploadListingImage};