const PinataService = require('../utils/pinataService');

class BrandController {
  async createBrand(req, res) {
    try {
      const { brandName, description, registrationDate } = req.body;
      const file = req.file;

      // Validasi input
      if (!brandName || !description || !registrationDate || !file) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields or logo file'
        });
      }

      // === Step 1: Upload file image ke Pinata ===
      const imageCID = await PinataService.uploadFile(file.buffer, `${brandName}_logo`);

      // === Step 2: Buat JSON metadata ===
      const metadata = {
        name: `Brand_${brandName}`,
        description,
        image: `https://gateway.pinata.cloud/ipfs/${imageCID}`,
        attributes: [
          { trait_type: 'verified', value: 'Yes' },
          { trait_type: 'registrationDate', value: registrationDate }
        ]
      };

      // === Step 3: Upload metadata JSON ke Pinata ===
      const jsonCID = await PinataService.uploadJSON(metadata, `${brandName}_metadata.json`);

      // === Step 4: Kirim response sukses ===
      return res.status(200).json({
        success: true,
        message: 'Brand metadata uploaded successfully',
        data: {
          imageCID,
          jsonCID,
          metadataURI: `ipfs://${jsonCID}`,
          metadata
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
