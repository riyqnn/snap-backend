const PinataService = require('../utils/pinataService');
const BlockchainService = require('../utils/blockchainServiceblockchain');
const ethers = require('ethers');

class BrandController {
  async createBrand(req, res) {
    try {
      const { brandName, description, registrationDate, privateKey, value } = req.body;
      const file = req.file; // Assuming multer is used for file upload

      if (!brandName || !description || !registrationDate || !privateKey || !value || !file) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters or file'
        });
      }

      // Initialize wallet
      const provider = new ethers.providers.JsonRpcProvider(process.env.WEB3_PROVIDER_URL);
      const wallet = new ethers.Wallet(privateKey, provider);

      // Step 1: Upload image to Pinata
      const imageCID = await PinataService.uploadFile(file.buffer, `${brandName}_image`);

      // Step 2: Create JSON metadata
      const metadata = {
        name: `${process.env.NAME_PREFIX || 'Brand_'}${brandName}`,
        description: description,
        image: `https://indigo-legislative-mackerel-269.mypinata.cloud/ipfs/${imageCID}`,
        attributes: [
          { trait_type: "verified", value: "Yes" },
          { trait_type: "registrationDate", value: registrationDate }
        ]
      };

      // Step 3: Upload JSON metadata to Pinata
      const jsonCID = await PinataService.uploadJSON(metadata, `${brandName}_metadata.json`);

      // Step 4: Call verifyBrand with JSON CID
      const metadataURI = `ipfs://${jsonCID}`;
      const result = await BlockchainService.verifyBrand(metadataURI, wallet, value);

      res.status(200).json({
        success: true,
        message: 'Brand NFT created and verified successfully',
        data: {
          imageCID,
          jsonCID,
          metadataURI,
          metadata,
          transaction: result
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new BrandController();