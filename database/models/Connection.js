const { DataTypes } = require("sequelize");
const sequelize = require("../connection");
const User = require("./User"); // Import the User model

const Connection = sequelize.define("Connection", {
    connection_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    connected_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM,
        values: ["pending", "accepted", "rejected"],
        defaultValue: "pending",
    },
});

// Define associations
Connection.belongsTo(User, { as: "requestingUser", foreignKey: "user_id" });
Connection.belongsTo(User, { as: "connectedUser", foreignKey: "connected_user_id" });

module.exports = Connection;
