const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const router = express.Router();

/**
 * Route to get Stripe configuration.
 * @route GET /config
 * @returns {Object} - An object containing the Stripe publishable key.
 */
router.get("/config", (req, res) => {
    res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});

/**
 * Route to create a payment intent.
 * @route POST /create-intent
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {number} req.body.total - The total amount for the payment intent.
 * @param {string} req.body.description - The description for the payment intent.
 * @param {Object} res - The response object.
 * @returns {Object} - An object containing the client secret of the payment intent.
 */
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
        });

    } catch (err) {
        res.status(400).json({
            status: "failed",
            message: err.message,
        });
    }
});

module.exports = router;