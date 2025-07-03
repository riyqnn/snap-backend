const express = require('express');
const router = express.Router();
const BrandController = require('../controllers/brandController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/create', upload.single('image'), BrandController.createBrand);

module.exports = router;