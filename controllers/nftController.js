const PinataService = require('../utils/pinataService');
const BlockchainService = require('../utils/blockchainService');
const { generateVerifyCode } = require('../utils/codeGenerator');
const { supabase } = require('../utils/supabaseClient');

class NFTController {
  async createSeries(req, res) {
    try {
      const { seriesId, maxSupply, brandOwner, name, description, registrationDate } = req.body;
      const file = req.file;

      if (!seriesId || !maxSupply || !brandOwner || !file || !name || !description || !registrationDate) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      // === 1. Upload image ke Pinata ===
      const imageCID = await PinataService.uploadFile(file.buffer, `series_${seriesId}_image`);
      const imageURL = `https://gateway.pinata.cloud/ipfs/${imageCID}`;

      // === 2. Buat metadata JSON ===
      const metadata = {
        name,
        description,
        image: imageURL,
        attributes: [
          { trait_type: 'verified', value: 'Yes' },
          { trait_type: 'registrationDate', value: registrationDate }
        ]
      };

      const jsonCID = await PinataService.uploadJSON(metadata, `series_${seriesId}_metadata`);
      const metadataURI = `ipfs://${jsonCID}`;

      // === 3. Call Smart Contract ===
      await BlockchainService.createSeries(seriesId, maxSupply, brandOwner);

      // === 4. Simpan ke Supabase (offchain) ===
      const insertedNFTs = [];
      for (let i = 1; i <= maxSupply; i++) {
        const serial_number = i;
        const verify_code = generateVerifyCode();
        const { data, error } = await supabase.from('product_nfts').insert([
          {
            series_id: seriesId,
            serial_number,
            uri: metadata,
            url: imageURL,
            verify_code
          }
        ]).select();

        if (error) throw error;
        insertedNFTs.push(data[0]);
      }

      // === 5. Response ===
      return res.status(201).json({
        success: true,
        message: `${maxSupply} NFTs minted for series ${seriesId}`,
        seriesId,
        metadataURI,
        nfts: insertedNFTs
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new NFTController();
