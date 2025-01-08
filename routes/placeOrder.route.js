const express = require('express');
const CropListing = require('../database/models/CropListing');
const TransportListing = require('../database/models/TransportListing');
const StorageListing = require('../database/models/StorageListing');
const User = require('../database/models/User');
const CropOrder = require('../database/models/CropOrder');
const Payment = require('../database/models/Payment');
const {authenticate} = require("../middleware/auth");
const sequelize = require('../database/connection');
const TransportOrder = require("../database/models/TransportOrder");
const StorageOrder = require("../database/models/StorageOrder");

const router = express.Router();

router.post('/crop', authenticate, async (req, res) => {
    try {

        const {stripeId, order} = req.body;

        const result = await sequelize.transaction(async () => {

            const cropListing = await CropListing.findByPk(order.cropId);
            const user = await User.findByPk(req.user.id);

            if (user.id === cropListing.UserId) {
                throw new Error("User can not buy their own items!");
            }

            const payment = await Payment.create({
                amount: order.amount,
                stripe_id: stripeId
            });

            const cropOrder = await CropOrder.create({
                quantity: order.qty,
                delivery_method: order.deliveryMethod,
                placed_address: order.address
            });

            await payment.setCropOrder(cropOrder);

            await cropListing.decrement('available_quantity', {by: order.qty});
            await cropListing.addCropOrder(cropOrder);
            await user.addCropOrder(cropOrder);

            return {cropOrder, payment};
        })


        res.status(200).json({
            status: "success",
            result: result,
        });

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

router.post('/transport', authenticate, async (req, res) => {
    try {

        const {stripeId, order} = req.body;

        const result = await sequelize.transaction(async () => {
            const payment = await Payment.create({
                amount: order.transportInfo.subTotal,
                stripe_id: stripeId
            });

            const {start, end} = order.transportInfo.locations;

            const transportOrder = await TransportOrder.create({
                booked_date: order.transportInfo.selectedDate,
                origin_lng: start.geoCodes.lng,
                origin_lat: start.geoCodes.lat,
                destination_lng: end.geoCodes.lng,
                destination_lat: end.geoCodes.lat,
                origin_address: start.address,
                destination_address: end.address,
                avg_distance: order.transportInfo.distance,
            });

            await payment.setTransportOrder(transportOrder);

            const transportListing = await TransportListing.findByPk(order.transportId);
            await transportListing.addTransportOrder(transportOrder);

            const user = await User.findByPk(req.user.id)
            await user.addTransportOrder(transportOrder);

            return {transportOrder, payment};
        })

        res.status(200).json({
            status: "success",
            message: "Transport order placed successfully!",
            result: result,
        });

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

router.post('/storage', authenticate, async (req, res) => {
    try {

        const {stripeId, order} = req.body;

        const result = await sequelize.transaction(async () => {
            const payment = await Payment.create({
                amount: order.orderInfo.subTotal,
                stripe_id: stripeId
            });

            const startDate = order.orderInfo.startDate;
            const endDate = order.orderInfo.endDate;

            const storageOrder = await StorageOrder.create({
                start_date: startDate,
                end_date: endDate,
            });

            await payment.setStorageOrder(storageOrder);

            const storageListing = await StorageListing.findByPk(order.storageId);
            await storageListing.addStorageOrder(storageOrder);

            const user = await User.findByPk(req.user.id)
            await user.addStorageOrder(storageOrder);

            return {storageOrder, payment};
        })

        res.status(200).json({
            status: "success",
            message: " Storage order placed successfully!",
            result: result,
        });

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

router.post('/delivery', authenticate, async (req, res) => {
    try {
        const {order, stripeId} = req.body;

        const result = await sequelize.transaction(async () => {

            const cropOrder = await CropOrder.create({
                quantity: order.crop.qty,
                delivery_method: order.crop.deliveryMethod,
                placed_address: order.crop.address
            });

            const transportOrder = await TransportOrder.create({
                booked_date: order.transport.booked_date,
                origin_lng: order.transport.origin_lng,
                origin_lat: order.transport.origin_lat,
                destination_lng: order.transport.destination_lng,
                destination_lat: order.transport.destination_lat,
                origin_address: order.transport.origin_address,
                destination_address: order.transport.destination_address,
                avg_distance: order.transport.avg_distance,
            });

            const payment = await Payment.create({
                amount: order.total,
                stripe_id: stripeId
            });

            cropOrder.setTransportOrder(transportOrder);

            await payment.setTransportOrder(transportOrder);
            await payment.setCropOrder(cropOrder);

            const transportListing = await TransportListing.findByPk(order.transport.transportId);
            const cropListing = await CropListing.findByPk(order.crop.cropId);

            await transportListing.addTransportOrder(transportOrder);
            await cropListing.addCropOrder(cropOrder);

            const user = await User.findByPk(req.user.id)
            await user.addTransportOrder(transportOrder);
            await user.addCropOrder(cropOrder);

        })
        res.status(200).json({
            status: "success",
            message: "Delivery placed successfully!",
            result: result,
        });
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
})

module.exports = router;