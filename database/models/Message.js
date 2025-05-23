const {Sequelize, DataTypes} = require("sequelize");
const sequelize = require("../connection");
const Listing = require("./Listing");
const Offer = require("./Offer");

const Message = sequelize.define("Message", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sender_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'sender_id',
    },
    receiver_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'receiver_id',
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        field: 'created_at',
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        field: 'updatedAt',
    },
}, {
    createdAt: 'created_at',
    updatedAt: 'updatedAt',
});

Message.belongsTo(Listing);
Listing.hasMany(Message);

Message.belongsTo(Offer);
Offer.hasOne(Message);

module.exports = Message;
