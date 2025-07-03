const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const brandRoutes = require('./routes/brandRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', brandRoutes);

