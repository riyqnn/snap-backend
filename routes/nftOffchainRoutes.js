const express = require('express');
const router = express.Router();
const NftOffchainController = require('../controllers/nftOffchainController');

router.post('/mint', NftOffchainController.mintNFTs);
router.get('/:series_id', NftOffchainController.getBySeriesId);
router.get('/verify/:code', NftOffchainController.getByVerifyCode);

module.exports = router;
