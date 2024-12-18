const {authenticate} = require("../middleware/auth");
const express = require("express");
const {Op, fn, col} = require("sequelize");
const CropOrder = require("../database/models/CropOrder");
const StorageOrder = require("../database/models/StorageOrder");
const TransportOrder = require("../database/models/TransportOrder");
const CropListing = require("../database/models/CropListing");
const TransportListing = require("../database/models/TransportListing");
const StorageListing = require("../database/models/StorageListing");
const Listing = require("../database/models/Listing");
const Payment = require("../database/models/Payment");

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

router.get('/stats', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const profileType = req.user.profile_type;

        const orderStats = {};
        const listingStats = {};
        let additionalStats = {};
        let salesByMonth = [];

        const getOrderStats = async (user_id, ListingModel, OrderModel, status) => {
            return await OrderModel.count({
                include: [
                    {
                        model: ListingModel,
                        required: true,
                        include: [
                            {
                                model: Listing,
                                required: true,
                                where: {UserId: user_id},
                            },
                        ],
                    },
                ],
                where: {status: status},
            });
        }

        const getListingStats = async (user_id, status) => {
            return await Listing.count({
                where: {
                    status: status,
                    UserId: user_id,
                }
            });
        }

        const getSalesByMonth = async (user_id) => {
            const sales = await CropOrder.findAll({
                attributes: [
                    [fn('MONTH', col('CropOrder.createdAt')), 'month'],
                    [fn('SUM', col('Payment.amount')), 'total_sales']
                ],
                include: [
                    {
                        model: CropListing,
                        required: true,
                        include: [
                            {
                                model: Listing,
                                required: true,
                                where: {UserId: user_id},
                            },
                        ],
                    },
                    {
                        model: Payment,
                        required: true,
                    },
                ],
                group: [fn('MONTH', col('CropOrder.createdAt'))],
                order: [[fn('MONTH', col('CropOrder.createdAt')), 'ASC']],
            });

            const salesData = new Array(12).fill(0);
            sales.forEach(sale => {
                salesData[sale.dataValues.month - 1] = parseFloat(sale.dataValues.total_sales);
            });

            return salesData;
        }

        if (profileType === "farmer" || profileType === "seller") {
            orderStats["delivered"] = await getOrderStats(userId, CropListing, CropOrder, "delivered");
            orderStats["pending"] = await getOrderStats(userId, CropListing, CropOrder, "pending");
            orderStats["processing"] = await getOrderStats(userId, CropListing, CropOrder, "processing");
            orderStats["cancelled"] = await getOrderStats(userId, CropListing, CropOrder, "cancelled");

            additionalStats["mostSoldCrops"] = await CropOrder.findAll({
                attributes: [
                    [fn('COUNT', col('CropOrder.id')), 'order_count']
                ],
                include: [
                    {
                        model: CropListing,
                        attributes: ['crop_name']
                    }
                ],
                group: ['CropListing.crop_name'],
                order: [[fn('COUNT', col('CropOrder.id')), 'DESC']],
                limit: 5
            });
            salesByMonth = await getSalesByMonth(userId);

        } else if (profileType === "transport") {
            orderStats["pending"] = await getOrderStats(userId, TransportListing, TransportOrder, "pending");
            orderStats["accepted"] = await getOrderStats(userId, TransportListing, TransportOrder, "accepted");
            orderStats["awaiting"] = await getOrderStats(userId, TransportListing, TransportOrder, "awaiting");
            orderStats["intransit"] = await getOrderStats(userId, TransportListing, TransportOrder, "intransit");
            orderStats["delivered"] = await getOrderStats(userId, TransportListing, TransportOrder, "delivered");

            additionalStats["mostCommonDestinations"] = await TransportOrder.findAll({
                attributes: ['destination_address', [fn('COUNT', col('TransportOrder.id')), 'count']],
                include: [
                    {
                        model: TransportListing,
                        attributes: [],
                        include: [
                            {
                                model: Listing,
                                where: {UserId: userId},
                                attributes: [],
                            },
                        ],
                    },
                ],
                group: ['destination_address'],
                order: [[fn('COUNT', col('TransportOrder.id')), 'DESC']],
                limit: 5,
            });

        } else if (profileType === "storage") {
            orderStats["pending"] = await getOrderStats(userId, StorageListing, StorageOrder, "pending");
            orderStats["accepted"] = await getOrderStats(userId, StorageListing, StorageOrder, "accepted");
            orderStats["awaiting"] = await getOrderStats(userId, StorageListing, StorageOrder, "awaiting");
            orderStats["instorage"] = await getOrderStats(userId, StorageListing, StorageOrder, "instorage");
            orderStats["completed"] = await getOrderStats(userId, StorageListing, StorageOrder, "completed");
            orderStats["overdue"] = await getOrderStats(userId, StorageListing, StorageOrder, "overdue");
            orderStats["abandoned"] = await getOrderStats(userId, StorageListing, StorageOrder, "abandoned");

            additionalStats["mostUsedFeatures"] = await StorageOrder.findAll({
                attributes: [
                    [fn('SUM', col('StorageListing.pest_control_availability')), 'pest_control'],
                    [fn('SUM', col('StorageListing.humidity_control_availability')), 'humidity_control'],
                    [fn('SUM', col('StorageListing.ventilation_availability')), 'ventilation'],
                    [fn('SUM', col('StorageListing.temperature_control')), 'temperature_control'],
                ],
                include: [
                    {
                        model: StorageListing,
                        attributes: [],
                        include: [
                            {
                                model: Listing,
                                where: {UserId: userId},
                                attributes: [],
                            },
                        ],
                    },
                ],
            });

        } else {
            return res.status(400).json({
                message: "unidentified user type!"
            });
        }

        listingStats["pending"] = await getListingStats(userId, "pending");
        listingStats["confirmed"] = await getListingStats(userId, "confirmed");
        listingStats["rejected"] = await getListingStats(userId, "rejected");

        return res.status(200).json({
            orderStats: orderStats,
            listingStats: listingStats,
            additionalStats: additionalStats,
            salesByMonth: salesByMonth,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
})

module.exports = router;