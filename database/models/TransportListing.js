const {DataTypes} = require('sequelize');
const sequelize = require('../connection');
const Listing = require('./Listing');

const TransportListing = sequelize.define('TransportListing', {
    vehicle_type: {
        type: DataTypes.ENUM,
        values: ['van', 'truck', 'trailer', 'three_wheeler', 'mini_van', 'mini_truck', 'pickup_truck'],
        defaultValue: 'van',
        allowNull: false,
    },
    fuel_type: {
        type: DataTypes.ENUM,
        values: ['petrol', 'diesel', 'electric'],
        defaultValue: 'petrol',
        allowNull: false,
    },
    price_per_km: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    max_weight: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    max_volume: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    temperature_control: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    temperature_control_max: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
    },
    temperature_control_min: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
    },
    refrigerated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});

Listing.hasOne(TransportListing);
TransportListing.belongsTo(Listing);

module.exports = TransportListing;