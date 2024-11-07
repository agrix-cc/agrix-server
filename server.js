const express = require('express');
const cors = require('cors');
const sequelize = require('./database/connection');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

const PORT = process.env.PORT;

sequelize.sync({force: false})
    .then(() => {
        console.log("All Database models were synchronized successfully!");
    })
    .catch(error => {
        console.error(`Error synchronizing the database: ${error}`);
    });

app.listen(PORT || 5050, () => {
    console.log(`Server is listening to PORT: ${PORT}`);
});