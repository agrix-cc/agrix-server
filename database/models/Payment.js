const { DataTypes } = require('sequelize');
const sequelize = require('../connection');
const CropOrder = require('./CropOrder');

const Payment = sequelize.define('Payment', {
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    stripe_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM,
        values: ['accepted', 'cancelled'],
        allowNull: false,
        defaultValue: 'accepted',
    }
});

module.exports = Payment;