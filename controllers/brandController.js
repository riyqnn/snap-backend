const PinataService = require('../utils/pinataService');

class BrandController {
  async createBrand(req, res) {
    try {
      const { brandName, description, registrationDate } = req.body;
      const file = req.file; // multer parses file

      if (!brandName || !description || !registrationDate || !file) {
        return res.status(400).json({ success: false, message: 'Missing required fields or file' });
      }

      // Step 1: Upload image to Pinata
      const imageCID = await PinataService.uploadFile(file.buffer, `${brandName}_logo`);

      // Step 2: Build JSON metadata
      const metadata = {
        name: `Brand_${brandName}`,
        description,
        image: `https://gateway.pinata.cloud/ipfs/${imageCID}`,
        attributes: [
          { trait_type: 'verified', value: 'Yes' },
          { trait_type: 'registrationDate', value: registrationDate }
        ]
      };

      // Step 3: Upload JSON metadata
      const jsonCID = await PinataService.uploadJSON(metadata, `${brandName}_metadata.json`);

      res.status(200).json({
        success: true,
        message: 'Metadata uploaded successfully',
        data: {
          imageCID,
          jsonCID,
          metadataURI: `ipfs://${jsonCID}`,
          metadata
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new BrandController();
