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
  
  async getBySeriesId(req, res) {
    try {
      const { series_id } = req.params;

      const { data, error } = await supabase
        .from('product_nfts')
        .select('*')
        .eq('series_id', series_id);

      if (error) throw error;

      if (data.length === 0) {
        return res.status(404).json({ success: false, message: 'No NFTs found for this series' });
      }

      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getByVerifyCode(req, res) {
    try {
      const { code } = req.params;

      const { data, error } = await supabase
        .from('product_nfts')
        .select('*')
        .eq('verify_code', code)
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return res.status(404).json({ success: false, message: 'NFT not found' });
      }

      res.status(200).json({ success: true, data: data[0] });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new NftOffchainController();
