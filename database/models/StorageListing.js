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
    total_units: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price_per_unit: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    volume_per_unit: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    max_capacity_per_unit: {
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