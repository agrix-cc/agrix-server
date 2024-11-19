const express = require('express');
const Listing = require('../database/models/Listing');
const {authenticate} = require("../middleware/auth");
const Payment = require("../database/models/Payment");
const User = require("../database/models/User");
const StorageOrder = require("../database/models/StorageOrder");
const TransportOrder = require("../database/models/TransportOrder");
const TransportListing = require("../database/models/TransportListing");
const StorageListing = require("../database/models/StorageListing");
const CropOrder = require("../database/models/CropOrder");
const CropListing = require("../database/models/CropListing");

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const user = req.user;

        if (user.profile_type === "transport") {
            const transportOrders = await TransportOrder.findAll({
                include: [
                    {
                        model: TransportListing,
                        include: [
                            {
                                model: Listing,
                                where: { UserId: user.id }
                            }
                        ]
                    },
                    Payment,
                ],
                where: {
                    '$TransportListing.Listing.UserId$': user.id
                }
            });

            res.status(200).json({
                status: "success",
                transportOrders: transportOrders,
            });
            return;
        }

        if (user.profile_type === "storage") {
            const storageOrders = await StorageOrder.findAll({
                include: [
                    {
                        model: StorageListing,
                        include: [
                            {
                                model: Listing,
                                where: { UserId: user.id }
                            }
                        ]
                    },
                    Payment,
                ],
                where: {
                    '$StorageListing.Listing.UserId$': user.id
                }
            });

            res.status(200).json({
                status: "success",
                storageOrders: storageOrders,
            });
            return;
        }

        const cropOrders = await CropOrder.findAll({
            include: [
                {
                    model: CropListing,
                    include: [
                        {
                            model: Listing,
                            where: { UserId: user.id }
                        }
                    ]
                },
                Payment,
            ],
            where: {
                '$CropListing.Listing.UserId$': user.id
            }
        });

        res.status(200).json({
            status: "success",
            cropOrders: cropOrders,
        });

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

router.get('/payments', authenticate, async (req, res) => {
    try {

        const user = req.user;

        const storageOrders = await StorageOrder.findAll({
            include: [Payment],
            where: {customer_id: user.id}
        });

        const cropOrders = await CropOrder.findAll({
            include: [Payment],
            where: {customer_id: user.id}
        });

        const transportOrders = await TransportOrder.findAll({
            include: [Payment],
            where: {customer_id: user.id}
        });

        res.status(200).json({
            status: 'success',
            crops: cropOrders,
            transport: transportOrders,
            storage: storageOrders,
        })

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
})

module.exports = router;