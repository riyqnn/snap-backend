const express = require('express');
const multer = require('multer');
const BrandController = require('../controllers/brandController');

const router = express.Router();
const upload = multer(); // memoryStorage

router.post('/create', upload.single('logo'), BrandController.createBrand);

module.exports = router;
