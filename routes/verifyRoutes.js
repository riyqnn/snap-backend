const express = require('express');
const { getVerifyPage, claimNFT } = require('../controllers/verifyController');

const router = express.Router();

// GET /api/verify
router.get('/verify', getVerifyPage);

// POST /api/verify
router.post('/verify', claimNFT);

module.exports = router;