// controllers/nftController.js
const supabase = require('../database/supabaseClient');
const { generateVerifyCode } = require('../utils/codeGenerator');

async function mintNFT(req, res) {
  const { series_id, quantity, uri } = req.body;

  if (!series_id || !quantity || !uri) {
    return res.status(400).json({ error: 'series_id, quantity, and uri are required' });
  }

  try {
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
            verify_code,
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
    console.error('❌ Insert error:', error.message);
    res.status(500).json({ error: 'Failed to mint NFT series' });
  }
}

module.exports = { mintNFT };
