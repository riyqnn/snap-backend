const pool = require('../database/db');
const { generateVerifyCode } = require('../utils/codeGenerator');

async function mintNFT(req, res) {
  const { brand_name, series_id, serial_number, uri, url } = req.body;
  const verify_code = generateVerifyCode();

  try {
    const result = await pool.query(
      `INSERT INTO product_nfts 
      (brand_name, series_id, serial_number, uri, url, verify_code)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [brand_name, series_id, serial_number, uri, url, verify_code]
    );

    res.status(201).json({
      message: 'NFT inserted successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('❌ Insert error:', err.message);
    res.status(500).json({ error: 'Failed to insert NFT' });
  }
}

module.exports = { mintNFT };
