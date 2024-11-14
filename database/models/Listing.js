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

// Listing model
Listing.belongsTo(User, { foreignKey: 'UserId' });
User.hasMany(Listing, { foreignKey: 'UserId' });

module.exports = Listing;