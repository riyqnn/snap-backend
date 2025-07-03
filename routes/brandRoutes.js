// routes/brandRoutes.js
const express = require('express');
const upload = require('../middleware/upload');
const { registerBrand } = require('../controllers/brandController');

const router = express.Router();

// POST /api/brand/register
router.post('/brand/register', upload.single('image'), registerBrand);

module.exports = router;


// controllers/brandController.js
const { uploadFileToIPFS, uploadJSONToIPFS } = require('../utils/pinataUpload');
const { generateNFTMetadata } = require('../utils/metadataGenerator');
const fs = require('fs');

async function registerBrand(req, res) {
  try {
    const { name, description } = req.body;
    if (!name || !description || !req.file) {
      return res.status(400).json({
        success: false,
        error: 'Name, description, and image are required.'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;

    // Upload image to IPFS
    const imageUpload = await uploadFileToIPFS(filePath, fileName);
    if (!imageUpload.success) {
      fs.unlinkSync(filePath);
      return res.status(500).json({ success: false, error: 'Failed to upload image', details: imageUpload.error });
    }

    // Generate and upload metadata to IPFS
    const metadata = generateNFTMetadata(name, description, imageUpload.url);
    const metadataUpload = await uploadJSONToIPFS(metadata, `${fileName}_metadata.json`);
    if (!metadataUpload.success) {
      fs.unlinkSync(filePath);
      return res.status(500).json({ success: false, error: 'Failed to upload metadata', details: metadataUpload.error });
    }

    fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      message: 'Brand registered successfully',
      metadataURI: `ipfs://${metadataUpload.ipfsHash}`,
      pinataURL: metadataUpload.url,
      metadata
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Register brand error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error', details: error.message });
  }
}

module.exports = { registerBrand };
