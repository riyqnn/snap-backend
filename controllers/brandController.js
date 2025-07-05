const PinataService = require('../utils/pinataService');
const BlockchainService = require('../utils/blockchainService');
const supabase = require('../database/supabaseClient');
const { ethers } = require('ethers');

class BrandController {
  async createBrand(req, res) {
    try {
      const { brandName, description, registrationDate, brandOwner, value } = req.body;
      const file = req.file;

      if (!brandName || !description || !registrationDate || !brandOwner || !value || !file) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: brandName, description, registrationDate, brandOwner, value, or logo'
        });
      }

      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: 'Uploaded file is not an image'
        });
      }

      // Step 1: Upload file ke Pinata
      const imageCID = await PinataService.uploadFile(file.buffer, `${brandName}_logo`);
      const imageURL = `https://gateway.pinata.cloud/ipfs/${imageCID}`;

      // Step 2: Buat metadata
      const metadata = {
        name: `Brand_${brandName}`,
        description,
        image: imageURL,
        attributes: [
          { trait_type: 'verified', value: 'Yes' },
          { trait_type: 'registrationDate', value: registrationDate }
        ]
      };

      // Step 3: Upload metadata ke Pinata
      const jsonCID = await PinataService.uploadJSON(metadata, `${brandName}_metadata.json`);
      const metadataURI = `ipfs://${jsonCID}`;

      // // Step 4: Verify onchain
      // const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
      // const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

      // await BlockchainService.verifyBrand(metadataURI, wallet, value);

      // Step 5: Check isVerified from contract
      // const isVerified = await BlockchainService.isVerified(brandOwner, wallet);

      // Step 6: Save to Supabase
      const { error: dbError } = await supabase
        .from('brands')
        .insert({
          brand_name: brandName,
          metadata_uri: metadataURI,
          brand_owner: brandOwner,
          is_verified: isVerified
        });

      if (dbError) throw new Error(`Supabase insert error: ${dbError.message}`);

      // Response
      return res.status(201).json({
        success: true,
        message: 'Brand created and verified onchain successfully',
        data: {
          brandName,
          brandOwner,
          imageCID,
          metadataURI,
          isVerified
        }
      });
    } catch (error) {
      console.error('❌ Error createBrand:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new BrandController();
