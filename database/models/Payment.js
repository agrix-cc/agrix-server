const {DataTypes} = require('sequelize');
const sequelize = require('../connection');

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
        values: ['accepted', 'canceled'],
        allowNull: false,
        defaultValue: 'accepted',
    }
});

module.exports = Payment;