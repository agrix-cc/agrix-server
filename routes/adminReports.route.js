const express = require("express");
const router = express.Router();
const User = require("../database/models/User");
const CropOrder = require("../database/models/CropOrder");
const TransportOrder = require("../database/models/TransportOrder");
const StorageOrder = require("../database/models/StorageOrder");
const CropListing = require("../database/models/CropListing");
const TransportListing = require("../database/models/TransportListing");
const StorageListing = require("../database/models/StorageListing");
const { authenticate } = require("../middleware/auth");
const sequelize = require("../database/connection"); // Ensure sequelize is imported

// Fetch user distribution
router.get("/user-distribution", authenticate, async (req, res) => {
    try {
        const userDistribution = await User.findAll({
            attributes: [
                [sequelize.literal(`CASE WHEN user_role = 'admin' THEN 'admin' ELSE profile_type END`), 'profile_type'],
                [sequelize.fn("COUNT", sequelize.col("profile_type")), "count"]
            ],
            group: ["profile_type"]
        });

        res.status(200).json({
            status: "success",
            data: userDistribution
        });
    } catch (error) {
        console.error("Error fetching user distribution:", error); // Add logging
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

// Fetch demand stats
router.get("/demand-stats", authenticate, async (req, res) => {
    try {
        const mostDemandCrops = await CropOrder.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('CropOrder.id')), 'order_count'],
                [sequelize.col('CropListing.crop_name'), 'crop_name']
            ],
            include: [{
                model: CropListing,
                attributes: []
            }],
            group: ['CropListing.crop_name'],
            order: [[sequelize.fn('COUNT', sequelize.col('CropOrder.id')), 'DESC']],
            limit: 5
        });

        const mostDemandDestinations = await TransportOrder.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('TransportOrder.id')), 'order_count'],
                'destination_address'
            ],
            group: ['destination_address'],
            order: [[sequelize.fn('COUNT', sequelize.col('TransportOrder.id')), 'DESC']],
            limit: 5
        });

        const mostDemandStorageFacilities = await StorageOrder.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('StorageOrder.id')), 'order_count'],
                [sequelize.col('StorageListing.storage_type'), 'storage_type']
            ],
            include: [{
                model: StorageListing,
                attributes: []
            }],
            group: ['StorageListing.storage_type'],
            order: [[sequelize.fn('COUNT', sequelize.col('StorageOrder.id')), 'DESC']],
            limit: 5
        });

        res.status(200).json({
            status: "success",
            data: {
                mostDemandCrops,
                mostDemandDestinations,
                mostDemandStorageFacilities
            }
        });
    } catch (error) {
        console.error("Error fetching demand stats:", error);
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

//least user type
router.get("/least-user-type", authenticate, async (req, res) => {
    try {
        const leastUsers = await User.findAll({
            attributes: [
                'profile_type',
                [sequelize.fn("COUNT", sequelize.col("profile_type")), "count"]
            ],
            where: { 
                user_role: { [sequelize.Op.ne]: 'admin' } // Exclude admin users
            },
            group: ['profile_type'],
            order: [[sequelize.fn("COUNT", sequelize.col("profile_type")), 'ASC']],
            limit: 1,
            raw: true // Ensure clean JSON
        });

        console.log("Query Result for Least Users:", leastUsers); // Log to confirm output

        if (leastUsers.length > 0) {
            const data = {
                profile_type: leastUsers[0].profile_type,
                count: leastUsers[0].count
            };
            res.status(200).json({
                status: "success",
                data
            });
        } else {
            res.status(200).json({
                status: "success",
                data: { profile_type: "N/A", count: 0 }
            });
        }
    } catch (error) {
        console.error("Error fetching least user type:", error);
        res.status(500).json({
            status: "failed",
            message: error.message
        });
    }
});

//insights for transport use
router.get("/recommend-transport-routes", authenticate, async (req, res) => {
    try {
        const topRoutes = await TransportOrder.findAll({
            attributes: [
                'destination_address',
                [sequelize.fn('COUNT', sequelize.col('destination_address')), 'order_count']
            ],
            group: ['destination_address'],
            order: [[sequelize.fn('COUNT', sequelize.col('destination_address')), 'DESC']],
            limit: 5
        });

        const recommendation = `Focus on the following top transport destinations: ${topRoutes.map(route => route.destination_address).join(', ')}`;

        res.status(200).json({
            status: "success",
            data: { topRoutes, recommendation }
        });
    } catch (error) {
        console.error("Error generating transport route recommendations:", error);
        res.status(500).json({ status: "failed", message: error.message });
    }
});

//For sellers
router.get("/recommend-sellers", authenticate, async (req, res) => {
    try {
        // Fetch top-selling products
        const topProducts = await CropOrder.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('CropOrder.id')), 'sales_count'],
                [sequelize.col('CropListing.crop_name'), 'crop_name']
            ],
            include: [{
                model: CropListing,
                attributes: [],
                required: true
            }],
            group: ['CropListing.crop_name'],
            order: [[sequelize.fn('COUNT', sequelize.col('CropOrder.id')), 'DESC']],
            limit: 5,
            raw: true
        });

        // Fetch top-selling locations using placed_address
        const topLocations = await CropOrder.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('CropOrder.id')), 'sales_count'],
                'placed_address' // Use the correct column name
            ],
            group: ['placed_address'],
            order: [[sequelize.fn('COUNT', sequelize.col('CropOrder.id')), 'DESC']],
            limit: 5,
            raw: true
        });

        // Generate recommendations
        const recommendations = `Focus on selling crops like "${topProducts.map(p => p.crop_name).join(", ")}" in high-demand locations such as "${topLocations.map(l => l.placed_address).join(", ")}".`;

        res.status(200).json({
            status: "success",
            data: {
                topProducts,
                topLocations,
                recommendations
            }
        });
    } catch (error) {
        console.error("Error fetching seller recommendations:", error);
        res.status(500).json({ status: "failed", message: error.message });
    }
});

module.exports = router;