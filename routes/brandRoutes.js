const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');

router.post('/verify-brand', brandController.verifyBrand);
router.get('/is-verified/:address', brandController.isVerified);
router.get('/token-uri/:tokenId', brandController.getTokenURI);
router.post('/set-token-uri', brandController.setTokenURI);
router.post('/withdraw', brandController.withdraw);
router.get('/contract-balance', brandController.getContractBalance);

module.exports = router;