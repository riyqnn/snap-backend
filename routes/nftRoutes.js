const express = require('express');
const { mintNFT, getAllNFTs, getSeriesStats } = require('../controllers/nftController');

const router = express.Router();

router.post('/mint', mintNFT);
router.get('/nfts', getAllNFTs);
router.get('/nfts/series/:series_id/stats', getSeriesStats);

module.exports = router;