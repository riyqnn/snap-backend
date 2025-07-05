const PinataService = require('../utils/pinataService');
const BlockchainService = require('../utils/blockchainService');

class BrandController {
  async createBrand(req, res) {
    try {
      const { brandName, description, registrationDate, wallet, value } = req.body;
      const file = req.file;

      if (!brandName || !description || !registrationDate || !file || !wallet || !value) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields (brand info, logo, wallet, or value)'
        });
      }

      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: 'Uploaded file is not an image'
        });
      }

      // Step 1: Upload Logo ke Pinata
      const imageCID = await PinataService.uploadFile(file.buffer, file.originalname);

      // Step 2: Buat dan Upload Metadata JSON ke Pinata
      const metadata = {
        name: `Brand_${brandName}`,
        description,
        image: `https://gateway.pinata.cloud/ipfs/${imageCID}`,
        attributes: [
          { trait_type: 'verified', value: 'Yes' },
          { trait_type: 'registrationDate', value: registrationDate }
        ]
      };

      const jsonCID = await PinataService.uploadJSON(metadata, `${brandName}_metadata.json`);
      const metadataURI = `ipfs://${jsonCID}`;

      // Step 3: Verify on Blockchain
      const txResult = await BlockchainService.verifyBrand(metadataURI, wallet, value);

      // Step 4: Return Response
      return res.status(200).json({
        success: true,
        message: 'Brand created and verified on blockchain',
        data: {
          imageCID,
          jsonCID,
          metadataURI,
          metadata,
          transaction: txResult
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new BrandController();
