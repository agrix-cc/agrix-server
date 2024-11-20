const express = require('express');
const Listing = require('../database/models/Listing');
const {authenticate} = require("../middleware/auth");
const Payment = require("../database/models/Payment");
const sequelize = require("../database/connection");
const StorageOrder = require("../database/models/StorageOrder");
const TransportOrder = require("../database/models/TransportOrder");
const TransportListing = require("../database/models/TransportListing");
const StorageListing = require("../database/models/StorageListing");
const CropOrder = require("../database/models/CropOrder");
const CropListing = require("../database/models/CropListing");
const {response} = require("express");

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

router.put('/edit', authenticate, async (req, res) => {
    try {
        const {status, type, id} = req.body;

        const result = await sequelize.transaction(async () => {

            if (type === "crop") {
                const crop = await CropOrder.findByPk(id);
                crop.status = status;
                await crop.save();

                return crop;
            }
            if (type === "storage") {
                const storage = await StorageOrder.findByPk(id);
                storage.status = status;
                await storage.save();

                return storage;
            }
            if (type === "transport") {
                const transport = await TransportOrder.findByPk(id);
                transport.status = status;
                await transport.save();

                return transport;
            }

            if (result) {
                res.status(200).json({
                    status: 'success',
                    result: result,
                })
            } else {
                throw new Error("Unexpected error!")
            }

        })
    }
    catch (error) {
        res.status(400).json({
            status: "failed",
            message: error.message,
        });
    }
})

module.exports = router;