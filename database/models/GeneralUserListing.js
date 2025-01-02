const {DataTypes} = require('sequelize');
const sequelize = require('../connection');
const Listing = require('./Listing');

const GeneralUserListing = sequelize.define('GeneralUserListing', {
    wanted_quantity: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
});
// Association between Listing and Crop listing
Listing.hasOne(GeneralUserListing);
GeneralUserListing.belongsTo(Listing);

module.exports = GeneralUserListing;