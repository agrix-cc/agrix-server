const {DataTypes} = require('sequelize');
const sequelize = require('../connection');
const TransportListing = require('./TransportListing');
const Payment = require("./Payment");
const User = require("./User");
const CropOrder = require("./CropOrder");

const TransportOrder = sequelize.define('TransportOrder', {
    booked_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    origin_lng: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    origin_lat: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    destination_lng: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    destination_lat: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    origin_address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    destination_address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    avg_distance: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM,
        values: ['pending', 'accepted', 'awaiting', 'intransit', 'delivered'],
        defaultValue: 'pending',
        allowNull: false,
    }
});

TransportOrder.belongsTo(Payment, { foreignKey: 'payment_id' });
Payment.hasOne(TransportOrder, { foreignKey: 'payment_id' });

TransportOrder.belongsTo(CropOrder, { foreignKey: 'crop_order_id' });
CropOrder.hasOne(TransportOrder, { foreignKey: 'crop_order_id' });

TransportOrder.belongsTo(TransportListing);
TransportListing.hasMany(TransportOrder);

TransportOrder.belongsTo(User, { foreignKey: 'customer_id' });
User.hasMany(TransportOrder, { foreignKey: 'customer_id' });

module.exports = TransportOrder;