const { uploadFileToIPFS, uploadJSONToIPFS } = require('../utils/pinataUpload');
const { generateNFTMetadata } = require('../utils/metadataGenerator');
const fs = require('fs');
const path = require('path');

// POST /api/upload
async function uploadImage(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const file = req.files[0]; // Ambil file pertama
    const { path: filePath, filename: fileName } = file;

    const { name, description } = req.body;

    if (!name || !description) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        error: 'Name and description are required'
      });
    }

    console.log('📤 Uploading image to IPFS...');

    const imageUpload = await uploadFileToIPFS(filePath, fileName);

    if (!imageUpload.success) {
      fs.unlinkSync(filePath);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload image to IPFS',
        details: imageUpload.error
      });
    }

    console.log('✅ Image uploaded to IPFS:', imageUpload.url);
    console.log('📝 Generating metadata...');

    const metadata = generateNFTMetadata(name, description, imageUpload.url);
    const metadataUpload = await uploadJSONToIPFS(metadata, `${fileName}_metadata.json`);

    if (!metadataUpload.success) {
      fs.unlinkSync(filePath);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload metadata to IPFS',
        details: metadataUpload.error
      });
    }

    console.log('✅ Metadata uploaded to IPFS:', metadataUpload.url);

    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'Image and metadata uploaded successfully',
      data: {
        name,
        description,
        image: {
          ipfsHash: imageUpload.ipfsHash,
          url: imageUpload.url
        },
        metadata: {
          ipfsHash: metadataUpload.ipfsHash,
          url: metadataUpload.url,
          json: metadata
        }
      }
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    if (req.files && req.files[0] && fs.existsSync(req.files[0].path)) {
      fs.unlinkSync(req.files[0].path);
    }
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      details: error.message
    });
  }
}


module.exports = {
  uploadImage
};