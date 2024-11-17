require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./database/connection');

// Routes
const signup = require('./routes/signup.route');
const signin = require('./routes/signin.route');
const createListing = require('./routes/createListing.route');
const getListings = require('./routes/getListings.route');
const getSingleListing = require('./routes/getSingleListing.route');
const stripe = require('./routes/stripe.route');
const placeOrder = require('./routes/placeOrder.route');
const search = require('./routes/search.route');

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
// Get all listings
app.use('/listings', getListings);
// View single listing
app.use('/view', getSingleListing);
// Stripe payment gateway routes
app.use('/stripe', stripe);
// Place order (Crop/Transport/Storage)
app.use('/order', placeOrder);
app.use('/search', search);

app.listen(PORT || 5050, () => {
    console.log(`Server is listening to PORT: ${PORT}`);
});

