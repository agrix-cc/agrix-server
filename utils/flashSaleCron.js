const cron = require('node-cron');
const { Op } = require('sequelize');
const CropListing = require('../database/models/CropListing');

const startFlashSaleCron = () => {
    cron.schedule('0 0 * * *', async () => {
        const currentDate = new Date();
        try {
            await CropListing.update(
                { is_flash_sale: true, discounted_price: sequelize.literal('price_per_kg * 0.6') },
                { where: { best_before_date: { [Op.lt]: currentDate }, is_flash_sale: false } }
            );
            console.log('Flash sale updates completed successfully!');
        } catch (error) {
            console.error('Error updating flash sales:', error.message);
        }
    });
};

module.exports = startFlashSaleCron;
