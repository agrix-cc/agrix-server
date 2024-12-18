const {DataTypes} = require('sequelize');
const sequelize = require('../connection');
const StorageListing = require('./StorageListing');
const Payment = require("./Payment");
const User = require("./User");

const StorageOrder = sequelize.define('StorageOrder', {
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM,
        values: ['pending', 'accepted', 'awaiting', 'instorage', 'completed', 'overdue', 'abandoned', 'cancelled'],
        defaultValue: 'pending',
        allowNull: false,
    }
});

StorageOrder.belongsTo(Payment, { foreignKey: 'payment_id' });
Payment.hasOne(StorageOrder, { foreignKey: 'payment_id' });

StorageOrder.belongsTo(StorageListing);
StorageListing.hasMany(StorageOrder);

StorageOrder.belongsTo(User, { foreignKey: 'customer_id' });
User.hasMany(StorageOrder, { foreignKey: 'customer_id' });

module.exports = StorageOrder;