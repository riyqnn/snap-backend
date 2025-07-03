const express = require('express');
const nftRoutes = require('./routes/nftRoutes'); // pastikan path-nya benar

const app = express();
app.use(express.json());
app.use('/api', nftRoutes); 

module.exports = app;
