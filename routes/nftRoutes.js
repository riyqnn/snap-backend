const express = require('express');
const { mintNFT, getAllNFTs } = require('../controllers/nftController');

const router = express.Router();

router.post('/mint', mintNFT);
router.get('/nfts', getAllNFTs); 


module.exports = router;
