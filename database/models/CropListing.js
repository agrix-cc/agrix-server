const {DataTypes} = require('sequelize');
const sequelize = require('../connection');
const Listing = require('./Listing');

const CropListing = sequelize.define('CropListing', {
    crop_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    crop_type: {
        type: DataTypes.ENUM,
        values: ['fruit', 'vegetable', 'grains'],
        default: 'vegetable',
        allowNull: false,
    },
    harvested_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    available_quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    price_per_kg: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    quality_condition: {
        type: DataTypes.ENUM,
        values: ['fresh', 'rotten', 'overripe'],
        default: 'fresh',
        allowNull: false,
    },
    quality_grade: {
        type: DataTypes.ENUM,
        values: ['A', 'B', 'C'],
        default: 'A',
        allowNull: false,
    },
    delivery_options: {
        type: DataTypes.ENUM,
        values: ['pickup', 'deliver', 'both'],
        default: 'pickup',
        allowNull: false,
    },
    delivery_fare_per_kg: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    organic: {
        type: DataTypes.BOOLEAN,
        default: false,
    },
});

Listing.hasOne(CropListing);
CropListing.belongsTo(Listing);

module.exports = CropListing;