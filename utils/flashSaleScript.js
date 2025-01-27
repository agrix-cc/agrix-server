const { Op } = require('sequelize');
const CropListing = require('../database/models/CropListing');
const {literal} = require("../database/connection");

const startFlashSale = async () => {
    try {
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        await CropListing.update(
            {
                discounted_price: literal('price_per_kg * 0.5'),
                is_flash_sale: true
            },
            {
                where: {
                    best_before_date: {
                        [Op.between]: [today, threeDaysFromNow]
                    },
                    is_flash_sale: false
                }

            }
        )

    } catch (err) {
        console.log(err)
    }
};

module.exports = startFlashSale;
