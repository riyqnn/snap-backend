const { uploadFileToIPFS, uploadJSONToIPFS } = require('../utils/pinataUpload');
const { generateNFTMetadata } = require('../utils/metadataGenerator');
const fs = require('fs');
const path = require('path');

// POST /api/upload
async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { name, description } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: 'Name and description are required'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;

    console.log('📤 Uploading image to IPFS...');
    
    // Upload image to IPFS
    const imageUpload = await uploadFileToIPFS(filePath, fileName);
    
    if (!imageUpload.success) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload image to IPFS',
        details: imageUpload.error
      });
    }

    console.log('✅ Image uploaded to IPFS:', imageUpload.url);
    console.log('📝 Generating metadata...');

    // Generate metadata
    const metadata = generateNFTMetadata(name, description, imageUpload.url);
    
    // Upload metadata to IPFS
    const metadataUpload = await uploadJSONToIPFS(metadata, `${fileName}_metadata.json`);
    
    if (!metadataUpload.success) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload metadata to IPFS',
        details: metadataUpload.error
      });
    }

    console.log('✅ Metadata uploaded to IPFS:', metadataUpload.url);

    // Clean up uploaded file
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
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
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