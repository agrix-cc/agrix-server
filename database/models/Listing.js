const {DataTypes} = require('sequelize');
const sequelize = require('../connection');
const User = require('./User');

const Listing = sequelize.define('Listing', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    city: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    district: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    listing_type: {
        type: DataTypes.ENUM,
        values: ['crop', 'storage', 'transport'],
        defaultValue: 'crop',
    },
});

User.hasMany(Listing);
Listing.belongsTo(User);

module.exports = Listing;