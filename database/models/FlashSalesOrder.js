const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const FlashSalesOrder = sequelize.define("FlashSalesOrder", {
    userId: {
        type: DataTypes.INTEGER, // Assuming foreign key reference to a user table with integer primary key
        allowNull: false,
        references: {
            model: "Users", // Name of the user table
            key: "id",
        },
    },
    cropId: {
        type: DataTypes.INTEGER, // Assuming foreign key reference to a crop table with integer primary key
        allowNull: false,
        references: {
            model: "CropListings", // Name of the crop table
            key: "id",
        },
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
        },
    },
    totalPrice: {
        type: DataTypes.FLOAT, // Using FLOAT for monetary values
        allowNull: false,
    },
    orderDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW, // Default to the current timestamp
    },
}, {
    tableName: "flashSalesOrders", // Table name in the database
    timestamps: false, // Disable Sequelize's automatic timestamps if not needed
});

module.exports = FlashSalesOrder;







