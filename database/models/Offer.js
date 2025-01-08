const {DataTypes} = require('sequelize');
const sequelize = require('../connection');
const Listing = require("./Listing");
const User = require("./User");

const Offer = sequelize.define('Offer', {
    offered_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    offered_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM,
        values: ['accepted', 'cancelled', "pending"],
        allowNull: false,
        defaultValue: 'pending',
    }
});

Offer.belongsTo(Listing, {
    foreignKey: "offered_listing_id",
    as: "offered_listing"
});
Listing.hasMany(Offer, {
    foreignKey: "offered_listing_id",
    as: "offered_listing"
});

Offer.belongsTo(Listing, {
    foreignKey: "wanted_listing_id",
    as: "wanted_listing"
});
Listing.hasMany(Offer, {
    foreignKey: "wanted_listing_id",
    as: "wanted_listing"
});

Offer.belongsTo(User, {
    foreignKey: "offered_to"
});
User.hasMany(Offer, {
    foreignKey: "offered_to"
});

module.exports = Offer;