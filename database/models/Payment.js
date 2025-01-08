const {DataTypes} = require('sequelize');
const sequelize = require('../connection');
// This model is to store the payment id from stripe and the amount
const Payment = sequelize.define('Payment', {
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    stripe_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM,
        values: ['accepted', 'cancelled'],
        allowNull: false,
        defaultValue: 'accepted',
    }
});

module.exports = Payment;