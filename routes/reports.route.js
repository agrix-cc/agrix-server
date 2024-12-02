const { authenticate } = require("../middleware/auth");
const express = require("express");
const { Op } = require("sequelize");
const CropOrder = require("../database/models/CropOrder");
const StorageOrder = require("../database/models/StorageOrder");
const TransportOrder = require("../database/models/TransportOrder");
const Listing = require("../database/models/Listing");

const router = express.Router();

router.get("/user-reports", authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const profileType = req.user.profile_type;

        let reportData = {};

        if (profileType === "farmer") {
            reportData.orders = await CropOrder.findAll({ where: { customer_id: userId } });
        } else if (profileType === "seller") {
            const listingIds = await Listing.findAll({
                where: { UserId: userId },
                attributes: ["id"],
            }).map((listing) => listing.id);

            reportData.orders = await CropOrder.findAll({ where: { CropListingId: { [Op.in]: listingIds } } });
        } else if (profileType === "storage") {
            reportData.orders = await StorageOrder.findAll({ where: { customer_id: userId } });
        } else if (profileType === "transport") {
            reportData.orders = await TransportOrder.findAll({ where: { customer_id: userId } });
        }

        if (["seller", "transport", "storage"].includes(profileType)) {
            reportData.listings = {
                current: await Listing.count({ where: { UserId: userId, status: "confirmed" } }),
                pending: await Listing.count({ where: { UserId: userId, status: "pending" } }),
                rejected: await Listing.count({ where: { UserId: userId, status: "rejected" } }),
            };
        }

        return res.json(reportData);
    } catch (error) {
        console.error("Error fetching reports:", error);
        return res.status(500).json({ message: "Error fetching reports." });
    }
});

module.exports = router;
