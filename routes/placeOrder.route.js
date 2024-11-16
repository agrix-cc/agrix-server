const express = require('express');
const CropListing = require('../database/models/CropListing');
const TransportListing = require('../database/models/TransportListing');
const User = require('../database/models/User');
const CropOrder = require('../database/models/CropOrder');
const Payment = require('../database/models/Payment');
const {authenticate} = require("../middleware/auth");
const sequelize = require('../database/connection');
const TransportOrder = require("../database/models/TransportOrder");

const router = express.Router();

router.post('/crop', authenticate, async (req, res) => {
    try {

        const {stripeId, order} = req.body;

        const result = await sequelize.transaction(async () => {
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

            const cropListing = await CropListing.findByPk(order.cropId);
            await cropListing.decrement('available_quantity', {by: order.qty});
            await cropListing.addCropOrder(cropOrder);

            const user = await User.findByPk(req.user.id)
            await user.addCropOrder(cropOrder);

            return {cropOrder, payment};
        })


        res.status(200).json({
            status: "success",
            message: "Test Crop order api",
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
            message: "Test Transport order api",
            result: result,
        });

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

router.post('/storage', async (req, res) => {
    try {
        res.status(200).json({
            status: "success",
            message: "Test Storage order api",
        });

    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message,
        });
    }
});

module.exports = router;