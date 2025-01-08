const express = require('express');
const router = express.Router();
const Message = require('../database/models/Message');
const Listing = require('../database/models/Listing');
const Offer = require('../database/models/Offer');
const ListingImage = require('../database/models/ListingImage');
const CropListing = require('../database/models/CropListing');
const Sequelize = require('sequelize');
const {authenticate} = require('../middleware/auth');
const User = require("../database/models/User");
const {getImage} = require("../utils/s3Client");
const {notify} = require("../utils/emailService");

router.get('/connections', authenticate, async (req, res) => {
    try {
        const connections = await Connection.findAll({
            where: {userId: req.user.id},
            include: [{model: User, attributes: ['id', 'first_name', 'last_name', 'profile_pic', 'status']}],
        });
        return res.json({connections});
    } catch (err) {
        console.error("Error fetching connections:", err);
        return res.status(500).json({error: "Failed to fetch connections"});
    }
});

router.post('/messages/send', authenticate, async (req, res) => {
    const {receiver_id, content, listing_id, offer_id} = req.body;
    const sender_id = req.user.id;

    if (!receiver_id || !content) {
        return res.status(400).json({error: 'Receiver ID and content are required'});
    }

    try {
        const message = await Message.create({
            sender_id,
            receiver_id,
            content,
        });

        if (listing_id) {
            const listing = await Listing.findByPk(listing_id);
            listing.addMessage(message);
        }
        if (offer_id) {
            const offer = await Offer.findByPk(offer_id);
            offer.setMessage(message);
        }

        const senderEmail = await User.findOne({
            where: {
                id: sender_id
            },
            attributes: ["email", "first_name", "last_name"]
        })

        const receiverEmail = await User.findOne({
            where: {
                id: receiver_id
            },
            attributes: ["email", "first_name", "last_name"]
        })

        const sendEmail = notify(
            receiverEmail.email,
            "You have received a new message",
            {
                receiver: receiverEmail.first_name + " " + receiverEmail.last_name,
                sender: senderEmail.first_name + " " + senderEmail.last_name,
                message: content,
            }
        );

        res.status(201).json({message: "Message sent!", data: message});

        await Promise.allSettled([sendEmail]);
    } catch (err) {
        console.error("Error sending message:", err);
        return res.status(500).json({error: "Failed to send message"});
    }
});

router.get('/conversation/:userId', authenticate, async (req, res) => {
    const sender_id = req.user.id;
    const receiver_id = parseInt(req.params.userId, 10);

    if (!receiver_id) {
        return res.status(400).json({error: "Invalid user ID"});
    }

    try {
        const messages = await Message.findAll({
            where: {
                [Sequelize.Op.or]: [
                    {sender_id, receiver_id},
                    {sender_id: receiver_id, receiver_id: sender_id},
                ],
            },
            order: [['created_at', 'ASC']],
            include: [
                {
                    model: Listing,
                    attributes: ['id', 'listing_type', 'title', 'description'],
                    include: [
                        {
                            model: ListingImage,
                            attributes: ['image']
                        }
                    ]
                },
                {
                    model: Offer,
                    include: [
                        {
                            model: Listing,
                            as: 'offered_listing',
                            include: {
                                model: CropListing,
                                attributes: ["price_per_kg"],
                            }
                        }
                    ]
                }
            ]
        });

        const sendResponse = await Promise.all(messages.map(async message => ({
            listing_id: message.Listing?.id,
            listing_type: message.Listing?.listing_type,
            listing_title: message.Listing?.title,
            listing_image: message.Listing?.ListingImages[0]?.image ? await getImage(message.Listing?.ListingImages[0].image) : null,
            listing_description: message.Listing?.description,
            offer: message.Offer || null,
            content: message.content,
            created_at: message.created_at,
            id: message.id,
            receiver_id: message.receiver_id,
            sender_id: message.sender_id,
            updatedAt: message.updatedAt,
        })));

        return res.status(200).json({data: sendResponse});
    } catch (err) {
        console.error("Error fetching messages:", err);
        return res.status(500).json({error: "Failed to fetch messages"});
    }
});


module.exports = router;