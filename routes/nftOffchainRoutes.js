const express = require('express');
const router = express.Router();
const NftOffchainController = require('../controllers/nftOffchainController');

router.post('/mint', NftOffchainController.mintNFTs);

module.exports = router;
