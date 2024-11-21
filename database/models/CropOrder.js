const {DataTypes} = require('sequelize');
const sequelize = require('../connection');
const CropListing = require('./CropListing');
const Payment = require("./Payment");
const User = require("./User");

const CropOrder = sequelize.define('CropOrder', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    delivery_method: {
        type: DataTypes.ENUM,
        values: ['deliver', 'pickup'],
        allowNull: false,
        defaultValue: 'pickup'
    },
    placed_address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM,
        values: ['pending', 'processing', 'cancelled', 'delivered'],
        defaultValue: 'pending',
        allowNull: false,
    }
});
// Relationship between CropOrder and Payment
CropOrder.belongsTo(Payment, { foreignKey: 'payment_id' });
Payment.hasOne(CropOrder, { foreignKey: 'payment_id' });
// Relationship between CropListing and CropOrder
CropOrder.belongsTo(CropListing);
CropListing.hasMany(CropOrder);
// Relationship between Crop order and Users
CropOrder.belongsTo(User, { foreignKey: 'customer_id' });
User.hasMany(CropOrder, { foreignKey: 'customer_id' });

module.exports = CropOrder;