const express = require('express');
const multer = require('multer');
const NFTController = require('../controllers/nftController');

const router = express.Router();
const upload = multer(); // pakai memory storage

router.post('/create-series', upload.single('file'), NFTController.createSeries);

module.exports = router;
