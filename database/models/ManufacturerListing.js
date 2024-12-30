const {DataTypes} = require('sequelize');
const sequelize = require('../connection');
const Listing = require('./Listing');

const ManufacturerListing = sequelize.define('ManufacturerListing', {
    wanted_quantity: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
});
// Association between Listing and Crop listing
Listing.hasOne(ManufacturerListing);
ManufacturerListing.belongsTo(Listing);

module.exports = ManufacturerListing;