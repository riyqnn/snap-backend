const supabase = require('../database/supabaseClient');
const { generateVerifyCode } = require('../utils/codeGenerator');

class NftOffchainController {
  async mintNFTs(req, res) {
    try {
      const { series_id, quantity, uri } = req.body;

      if (!series_id || !quantity || !uri || !uri.image) {
        return res.status(400).json({ message: 'Missing required data' });
      }

      const insertedNFTs = [];

      for (let i = 1; i <= quantity; i++) {
        const serial_number = i;
        const verify_code = generateVerifyCode();
        const url = uri.image;

        const { data, error } = await supabase
          .from('product_nfts')
          .insert([
            {
              series_id,
              serial_number,
              uri,
              url,
              verify_code
            }
          ])
          .select();

        if (error) throw error;

        insertedNFTs.push(data[0]);
      }

      res.status(201).json({
        message: `${quantity} NFT minted successfully`,
        series_id,
        nfts: insertedNFTs
      });
    } catch (error) {
      console.error('❌ Mint error:', error.message);
      res.status(500).json({ error: 'Failed to mint NFTs offchain' });
    }
  }
}

module.exports = new NftOffchainController();
