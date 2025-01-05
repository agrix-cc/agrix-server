// // agrix-server\database\models\CropListing.js
// const { DataTypes } = require("sequelize");
// const sequelize = require("../connection");
// const Listing = require("./Listing");

// const CropListing = sequelize.define("CropListing", {
//   crop_name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   crop_type: {
//     type: DataTypes.ENUM,
//     values: ["fruit", "vegetable", "grains"],
//     defaultValue: "vegetable",
//     allowNull: false,
//   },
//   harvested_date: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
//   best_before_date: {
//     type: DataTypes.DATE,
//     allowNull: true,
//   },
//   expiration_date: {
//     type: DataTypes.DATE,
//     allowNull: true,
//   },
//   is_flash_sale: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//   },
//   discounted_price: {
//     type: DataTypes.FLOAT,
//     allowNull: true,
//   },
//   available_quantity: {
//     type: DataTypes.DOUBLE,
//     allowNull: false,
//   },
//   price_per_kg: {
//     type: DataTypes.DOUBLE,
//     allowNull: false,
//   },
//   quality_condition: {
//     type: DataTypes.ENUM,
//     values: ["fresh", "rotten", "overripe"],
//     defaultValue: "fresh",
//     allowNull: false,
//   },
//   quality_grade: {
//     type: DataTypes.ENUM,
//     values: ["A", "B", "C"],
//     defaultValue: "A",
//     allowNull: false,
//   },
//   delivery_options: {
//     type: DataTypes.ENUM,
//     values: ["pickup", "deliver", "both"],
//     defaultValue: "pickup",
//     allowNull: false,
//   },
//   delivery_fare_per_kg: {
//     type: DataTypes.DOUBLE,
//     allowNull: true,
//   },
//   organic: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//   },
// });

// // Hook for automatic flash sale activation
// CropListing.addHook("afterFind", (listing) => {
//   if (listing) {
//     const currentDate = new Date();
//     if (listing.best_before_date && currentDate > listing.best_before_date) {
//       listing.is_flash_sale = true;
//       listing.discounted_price = listing.price_per_kg * 0.8; 
//     }
//   }
// });

// Listing.hasOne(CropListing);
// CropListing.belongsTo(Listing);

// module.exports = CropListing;













// agrix-server/database/models/CropListing.js
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
    expiration_date: {
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
});

// Hook for flash sale discounts
CropListing.addHook("afterFind", (listing) => {
    if (listing) {
        const currentDate = new Date();
        if (listing.best_before_date && currentDate > listing.best_before_date) {
            listing.is_flash_sale = true;
            listing.discounted_price = listing.price_per_kg * 0.8;
        }
    }
});

Listing.hasOne(CropListing);
CropListing.belongsTo(Listing);

module.exports = CropListing;
