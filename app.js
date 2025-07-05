require('dotenv').config();
const express = require('express');
const brandRoutes = require('./routes/brandRoutes');
const nftRoutes = require('./routes/nftRoutes');
const nftOffchainRoutes = require('./routes/nftOffchainRoutes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors()); // 👈 tambahkan ini sebelum routes


app.use('/api/brand', brandRoutes);
app.use('/api/nft', nftRoutes);
app.use('/api/nfts', nftOffchainRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
