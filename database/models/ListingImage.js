const {DataTypes} = require('sequelize');
const sequelize = require('../connection');
const Listing = require("./Listing");
// This model is to store image names that is stored in AWS S3 bucket which is associated with listings
const ListingImage = sequelize.define('ListingImage', {
    image: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});
// Relationship between ListingImage and Listing
Listing.hasMany(ListingImage);
ListingImage.belongsTo(Listing);

module.exports = ListingImage;