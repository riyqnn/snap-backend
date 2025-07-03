const express = require('express');
const { mintNFT } = require('../controllers/nftController');

const router = express.Router();

router.post('/mint', mintNFT);

module.exports = router;
