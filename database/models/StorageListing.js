const {DataTypes} = require('sequelize');
const sequelize = require('../connection');
const Listing = require('./Listing');

const StorageListing = sequelize.define('StorageListing', {
    storage_type: {
        type: DataTypes.ENUM,
        values: ['cold_room', 'dry_room'],
        defaultValue: 'cold_room',
        allowNull: false,
    },
    max_capacity: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    width: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    length: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    height: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    pricing_plan: {
        type: DataTypes.ENUM,
        values: ['daily', 'monthly', 'both'],
        defaultValue: 'both',
        allowNull: false,
    },
    daily_rate: {
        type: DataTypes.DOUBLE,
    },
    monthly_rate: {
        type: DataTypes.DOUBLE,
    },
    minimum_days: {
        type: DataTypes.INTEGER,
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
    humidity_control_availability: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    ventilation_availability: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    pest_control_availability: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});

Listing.hasOne(StorageListing);
StorageListing.belongsTo(Listing);

module.exports = StorageListing;