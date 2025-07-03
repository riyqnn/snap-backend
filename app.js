const express = require('express');
const nftRoutes = require('./routes/nftRoutes');

const app = express();
app.use(express.json());

app.use('/api', nftRoutes); 

module.exports = app;
