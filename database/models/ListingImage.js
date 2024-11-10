const {DataTypes} = require('sequelize');
const sequelize = require('../connection');
const Listing = require("./Listing");

const ListingImage = sequelize.define('ListingImage', {
    image: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

Listing.hasMany(ListingImage);
ListingImage.belongsTo(Listing);

module.exports = ListingImage;