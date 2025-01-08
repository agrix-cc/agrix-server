const {DataTypes} = require('sequelize');
const sequelize = require('../connection');
const Listing = require('./Listing');

const WantedListing = sequelize.define('WantedListing', {
    wanted_quantity: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    wanted_price: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    is_donation: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false,
    }
});
// Association between Listing and Crop listing
Listing.hasOne(WantedListing);
WantedListing.belongsTo(Listing);

module.exports = WantedListing;