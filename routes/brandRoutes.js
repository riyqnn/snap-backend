const express = require('express');
const multer = require('multer');
const BrandController = require('../controllers/brandController');

const router = express.Router();
const upload = multer(); // memoryStorage

router.post('/create', upload.single('logo'), BrandController.createBrand);

const imageCID = await PinataService.uploadFile(file.buffer, 'nama_file_logo');
const jsonCID = await PinataService.uploadJSON(metadata, 'nama_metadata.json');

module.exports = router;
