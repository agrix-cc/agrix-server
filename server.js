require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const sequelize = require('./database/connection');

// Routes
const signup = require('./routes/signup.route');
const signin = require('./routes/signin.route');
const createListing = require('./routes/createListing.route');
const editListing = require('./routes/editListing.route');
const deleteListing = require('./routes/deleteListing.route');
const getListings = require('./routes/getListings.route');
const getSingleListing = require('./routes/getSingleListing.route');
const stripe = require('./routes/stripe.route');
const placeOrder = require('./routes/placeOrder.route');
const orders = require('./routes/orders.route');
const offers = require('./routes/offers.route');
const search = require('./routes/search.route');
const profile = require('./routes/profile.route');
const profileRoute = require("./routes/userProfile.route");
const reports = require("./routes/reports.route");
const admin = require("./routes/auth.route");
const manageUsers = require("./routes/manageUsers.route");
const adminReports = require("./routes/adminReports.route");
const emailRoutes = require('./routes/emailRoutes');
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const startFlashSale = require('./utils/flashSaleScript');
const server = http.createServer(app);
const io = socketIo(server);

//const use = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.set('socket', io);

const PORT = process.env.PORT;

/**
 * Synchronizes all database models and starts the server.
 * make { force: true } to reset the database
 * make { force: false, alter: true } to alter tables
 */
sequelize.sync({force: false, alter: false})
    .then(() => {
        console.log("All Database models were synchronized successfully!");
    })
    .catch(error => {
        console.error(`Error synchronizing the database: ${error}`);
    });

app.use('/auth', admin);
// Sign up route
app.use('/signup', signup);
// Sign in route
app.use('/signin', signin);
// Update profile route
app.use('/profile', profile);
// Create new listing route
app.use('/add-new', createListing);
// Get all listings
app.use('/listings', getListings);
// View single listing
app.use('/view', getSingleListing);
// Edit single listing
app.use('/edit', editListing);
// Delete a listing
app.use('/delete', deleteListing);
// Stripe payment gateway routes
app.use('/stripe', stripe);
// Place order (Crop/Transport/Storage)
app.use('/order', placeOrder);
// Orders route
app.use('/orders', orders);
// Search route
app.use('/search', search);
//Redirecting to profile
app.use("/profile", profileRoute); // New profile route
//for reports
app.use("/reports", reports);
// Manage users route
app.use("/manage-users", manageUsers);
// Admin reports route
app.use("/admin-reports", adminReports);
// Email sending API route
app.use('/api', emailRoutes);
// Message senrding API route
app.use("/api", messageRoutes);

app.use("/offers", offers);

app.use("/flash-sale", require("./routes/flashsale.route"));

setInterval(async () => {
    await startFlashSale();
}, 60000);
/**
 * Starts the server and listens on the specified port.
 */
app.listen(PORT || 5050, () => {
    console.log(`Server is listening to PORT: ${PORT}`);
});