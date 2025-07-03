// app.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const nftRoutes = require('./routes/nftRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const brandRoutes = require('./routes/brandRoutes');



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setup route
app.use('/api', nftRoutes);
app.use('/api', uploadRoutes);
app.use('/api', verifyRoutes);
app.use('/api', brandRoutes);

module.exports = app;
