const { Sequelize } = require('sequelize');

// Database credentials from .env
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

// SSL configuration with a single certificate
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: "mysql",
    port: DB_PORT,
});

// Establish connection with MySQL database
sequelize.authenticate()
    .then(() => {
        console.log('Connection established successfully!');
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize;