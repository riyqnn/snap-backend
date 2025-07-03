const supabase = require('../database/supabaseClient');
const { generateVerifyCode } = require('../utils/codeGenerator');

async function mintNFT(req, res) {
  const { brand_name, series_id, serial_number, uri, url } = req.body;
  const verify_code = generateVerifyCode();

  const { data, error } = await supabase
    .from('product_nfts')
    .insert([
      {
        brand_name,
        series_id,
        serial_number,
        uri,
        url,
        verify_code,
      }
    ])
    .select();

  if (error) {
    console.error('❌ Insert error:', error.message);
    return res.status(500).json({ error: 'Failed to insert NFT' });
  }

  res.status(201).json({
    message: 'NFT inserted successfully',
    data: data[0],
  });
}

module.exports = { mintNFT };
