
const multer = require('multer');
const express = require('express');

const BrandController = require('../controllers/brandController');

const router = express.Router();
const upload = multer(); // memoryStorage

router.post('/create', upload.single('logo'), BrandController.createBrand);

module.exports = router;
