const supabase = require('../database/supabaseClient');
const { generateVerifyCode } = require('../utils/codeGenerator');

// POST /api/mint
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
            is_collected: false,
            wallet_collector: null
          }
        ])
        .select();

      if (error) throw error;

      insertedNFTs.push(data[0]);
    }

    res.status(201).json({
    message: `${quantity} NFT minted successfully`,
    series_id,
    nfts: insertedNFTs.map(nft => ({
      series_id: nft.series_id,
      serial_number: nft.serial_number,
      verify_url: `https://snap-backend-0ewf.onrender.com/api/verify?series=${nft.series_id}&serialNumber=${nft.serial_number}`,
      url: nft.url
    }))
  });
  } catch (error) {
    console.error('❌ Insert error:', error.message);
    res.status(500).json({ error: 'Failed to mint NFT series' });
  }
}

// GET /api/nfts
async function getAllNFTs(req, res) {
  try {
    const { data, error } = await supabase
      .from('product_nfts')
      .select('*');

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch NFTs' });
  }
}

module.exports = { mintNFT, getAllNFTs };
