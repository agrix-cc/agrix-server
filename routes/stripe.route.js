const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const router = express.Router();

router.get("/config", (req, res) => {
    res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});

router.post('/create-intent', async (req, res) => {
    try {

        const {total, description} = req.body;

        const intent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100),
            currency: 'lkr',
            automatic_payment_methods: {
                enabled: true
            },
            description: description,
        });

        res.status(200).json({
            status: "success",
            client_secret: intent.client_secret
        })

    } catch (err) {
        res.status(400).json({
            status: "failed",
            message: err.message,
        })
    }
});

module.exports = router;