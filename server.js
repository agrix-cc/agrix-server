const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

const PORT = process.env.PORT;

app.listen(PORT || 5050, () => {
    console.log(`Server is listening to PORT: ${PORT}`);
});