const PinataService = require('../utils/pinataService');
const BlockchainService = require('../utils/blockchainService');
const { generateVerifyCode } = require('../utils/codeGenerator');
const { supabase } = require('../database/supabaseClient');

class NFTController {
  async createSeries(req, res) {
    try {
      const { seriesId, maxSupply, brandOwner } = req.body;
      const file = req.file;

      // Validasi input
      if (!seriesId || !maxSupply || !brandOwner || !file) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: seriesId, maxSupply, brandOwner, or file'
        });
      }

      // === 1. Upload gambar ke Pinata ===
      const imageCID = await PinataService.uploadFile(file.buffer, `series_${seriesId}_image`);
      const imageURL = `https://gateway.pinata.cloud/ipfs/${imageCID}`;

      // === 2. Buat metadata default ===
      const metadata = {
        name: `Series ${seriesId}`,
        description: `Auto-generated NFT series #${seriesId}`,
        image: imageURL,
        attributes: [
          { trait_type: 'verified', value: 'Yes' },
          { trait_type: 'series_id', value: seriesId.toString() }
        ]
      };

      const jsonCID = await PinataService.uploadJSON(metadata, `series_${seriesId}_metadata`);
      const metadataURI = `ipfs://${jsonCID}`;

      // === 3. Panggil Smart Contract ===
      await BlockchainService.createSeries(seriesId, maxSupply, brandOwner);

      // === 4. Simpan NFT ke Supabase ===
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

      // === 5. Respon sukses ===
      return res.status(201).json({
        success: true,
        message: `${maxSupply} NFTs minted for series ${seriesId}`,
        seriesId,
        metadataURI,
        nfts: insertedNFTs
      });
    } catch (error) {
      console.error('❌ Error createSeries:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new NFTController();
