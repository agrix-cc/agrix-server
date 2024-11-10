const express = require('express');
const cors = require('cors');
const sequelize = require('./database/connection');

// Routes
const signup = require('./routes/signup.route');
const signin = require('./routes/signin.route');
const createListing = require('./routes/createListing.route');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors());

const PORT = process.env.PORT;

sequelize.sync({force: false})
    .then(() => {
        console.log("All Database models were synchronized successfully!");
    })
    .catch(error => {
        console.error(`Error synchronizing the database: ${error}`);
    });

// Sign up route
app.use('/signup', signup);
// Sign in route
app.use('/signin', signin);
// Create new listing route
app.use('/add-new', createListing);

app.listen(PORT || 5050, () => {
    console.log(`Server is listening to PORT: ${PORT}`);
});

