const {DataTypes} = require('sequelize');
const sequelize = require('../connection');
const CropListing = require('./CropListing');
const Payment = require("./Payment");
const User = require("./User");

const CropOrder = sequelize.define('CropOrder', {
    payment_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    crop_type: {
        type: DataTypes.ENUM,
        values: ['fruit', 'vegetable', 'grains'],
        defaultValue: 'vegetable',
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
        defaultValue: 'fresh',
        allowNull: false,
    },
    quality_grade: {
        type: DataTypes.ENUM,
        values: ['A', 'B', 'C'],
        defaultValue: 'A',
        allowNull: false,
    },
    delivery_options: {
        type: DataTypes.ENUM,
        values: ['pickup', 'deliver', 'both'],
        defaultValue: 'pickup',
        allowNull: false,
    },
    delivery_fare_per_kg: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    organic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});

CropOrder.belongsTo(CropListing);
CropListing.hasMany(CropOrder);

CropOrder.belongsTo(Payment);
Payment.hasOne(CropOrder);

CropOrder.belongsTo(User, { foreignKey: 'customer_id' });
User.hasMany(CropOrder, { foreignKey: 'customer_id' });

module.exports = CropOrder;