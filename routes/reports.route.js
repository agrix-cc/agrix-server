const {authenticate} = require("../middleware/auth");
const express = require("express");
const {Op} = require("sequelize");
const CropOrder = require("../database/models/CropOrder");
const StorageOrder = require("../database/models/StorageOrder");
const TransportOrder = require("../database/models/TransportOrder");
const CropListing = require("../database/models/CropListing");
const TransportListing = require("../database/models/TransportListing");
const StorageListing = require("../database/models/StorageListing");
const Listing = require("../database/models/Listing");

const router = express.Router();

router.get("/user-reports", authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const profileType = req.user.profile_type;

        let reportData = {};

        if (profileType === "farmer") {
            reportData.orders = await CropOrder.findAll({where: {customer_id: userId}});
        } else if (profileType === "seller") {
            const listingIds = await Listing.findAll({
                where: {UserId: userId},
                attributes: ["id"],
            }).map((listing) => listing.id);

            reportData.orders = await CropOrder.findAll({where: {CropListingId: {[Op.in]: listingIds}}});
        } else if (profileType === "storage") {
            reportData.orders = await StorageOrder.findAll({where: {customer_id: userId}});
        } else if (profileType === "transport") {
            reportData.orders = await TransportOrder.findAll({where: {customer_id: userId}});
        }

        if (["seller", "transport", "storage"].includes(profileType)) {
            reportData.listings = {
                current: await Listing.count({where: {UserId: userId, status: "confirmed"}}),
                pending: await Listing.count({where: {UserId: userId, status: "pending"}}),
                rejected: await Listing.count({where: {UserId: userId, status: "rejected"}}),
            };
        }

        return res.json(reportData);
    } catch (error) {
        console.error("Error fetching reports:", error);
        return res.status(500).json({message: "Error fetching reports."});
    }
});

// Optimised way to retrieve stats
// Get only the necessary items from the database rather getting all the information
// Get the count of orders
// https://sequelize.org/docs/v7/querying/select-methods/#count
router.get('/stats', authenticate, async (req, res) => {
    try {

        const userId = req.user.id;
        const profileType = req.user.profile_type;

        // Initialise objects to store stats counts
        const orderStats = {};
        const listingStats = {};

        // Function to get the stats of orders based on the listing type and status of the order
        // Refer to these documentations
        // https://sequelize.org/docs/v7/querying/select-methods/#count
        // https://sequelize.org/docs/v6/advanced-association-concepts/eager-loading/
        const getOrderStats = async (user_id, ListingModel, OrderModel, status) => {
            return await OrderModel.count({
                include: [
                    {
                        model: ListingModel,
                        required: true, // Inner join
                        include: [
                            {
                                model: Listing,
                                required: true, // Inner join
                                where: {UserId: user_id},
                            },
                        ],
                    },
                ],
                where: {status: status},
            });
        }

        // Function to get the listing count based on listing status (pending, confirmed, rejected)
        const getListingStats = async (user_id, status) => {
            return await Listing.count({
                where: {
                    status: status,
                    UserId: user_id,
                }
            });
        }

        // Call above defined functions to get the stats count of orders based on the profile type
        if (profileType === "farmer" || profileType === "seller") {
            orderStats["delivered"] = await getOrderStats(userId, CropListing, CropOrder, "delivered");
            orderStats["pending"] = await getOrderStats(userId, CropListing, CropOrder, "pending");
            orderStats["processing"] = await getOrderStats(userId, CropListing, CropOrder, "processing");
            orderStats["cancelled"] = await getOrderStats(userId, CropListing, CropOrder, "cancelled");

        } else if (profileType === "transport") {
            orderStats["pending"] = await getOrderStats(userId, TransportListing, TransportOrder, "pending");
            orderStats["accepted"] = await getOrderStats(userId, TransportListing, TransportOrder, "accepted");
            orderStats["awaiting"] = await getOrderStats(userId, TransportListing, TransportOrder, "awaiting");
            orderStats["intransit"] = await getOrderStats(userId, TransportListing, TransportOrder, "intransit");
            orderStats["delivered"] = await getOrderStats(userId, TransportListing, TransportOrder, "delivered");

        } else if (profileType === "storage") {
            orderStats["pending"] = await getOrderStats(userId, StorageListing, StorageOrder, "pending");
            orderStats["accepted"] = await getOrderStats(userId, StorageListing, StorageOrder, "accepted");
            orderStats["awaiting"] = await getOrderStats(userId, StorageListing, StorageOrder, "awaiting");
            orderStats["instorage"] = await getOrderStats(userId, StorageListing, StorageOrder, "instorage");
            orderStats["completed"] = await getOrderStats(userId, StorageListing, StorageOrder, "completed");
            orderStats["overdue"] = await getOrderStats(userId, StorageListing, StorageOrder, "overdue");
            orderStats["abandoned"] = await getOrderStats(userId, StorageListing, StorageOrder, "abandoned");

        } else {
            // If user type is not from the above user types handle error
            return res.status(400).json({
                message: "unidentified user type!"
            });
        }

        // get stats count of listings by calling above defined method
        listingStats["pending"] = await getListingStats(userId, "pending");
        listingStats["confirmed"] = await getListingStats(userId, "confirmed");
        listingStats["rejected"] = await getListingStats(userId, "rejected");

        // Send successful response
        return res.status(200).json({
            orderStats: orderStats,
            listingStats: listingStats,
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }
})

module.exports = router;
