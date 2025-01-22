const { DataTypes } = require("sequelize");
const sequelize = require("../connection");
const Listing = require("./Listing");

const CropListing = sequelize.define("CropListing", {
    crop_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    crop_type: {
        type: DataTypes.ENUM,
        values: ["fruit", "vegetable", "grains"],
        defaultValue: "vegetable",
        allowNull: false,
    },
    harvested_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    best_before_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    is_flash_sale: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },

    discounted_price: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    available_quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    price_per_kg: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    quality_condition: {
        type: DataTypes.ENUM,
        values: ["fresh", "rotten", "overripe"],
        defaultValue: "fresh",
        allowNull: false,
    },
    quality_grade: {
        type: DataTypes.ENUM,
        values: ["A", "B", "C"],
        defaultValue: "A",
        allowNull: false,
    },
    delivery_options: {
        type: DataTypes.ENUM,
        values: ["pickup", "deliver", "both"],
        defaultValue: "pickup",
        allowNull: false,
    },
    delivery_fare_per_kg: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    organic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
},{
        getterMethods: {
            flash_sale_end() {

                if (this.best_before_date) {
                    const end = new Date(this.best_before_date);
                    end.setDate(end.getDate() + 3); 
                    return end;
                }
                return this.expiration_date || null;
            },
        },
    
});



Listing.hasOne(CropListing);
CropListing.belongsTo(Listing);

module.exports = CropListing;


















