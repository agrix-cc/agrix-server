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
        const intent = await stripe.paymentIntents.create({
            amount: 150,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true
            },
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