const supabase = require('../database/supabaseClient');
const { generateVerifyCode } = require('../utils/codeGenerator');

// POST /api/mint
async function mintNFT(req, res) {
  const { series_id, quantity, uri } = req.body;

  // Validation
  if (!series_id || !quantity || !uri) {
    return res.status(400).json({
      success: false,
      error: 'series_id, quantity, and uri are required'
    });
  }

  if (quantity <= 0 || quantity > 1000) {
    return res.status(400).json({
      success: false,
      error: 'Quantity must be between 1 and 1000'
    });
  }

  try {
    console.log(`🔨 Minting ${quantity} NFTs for series ${series_id}...`);

    // Get last serial number for this series
    const { data: lastNFT, error: lastError } = await supabase
      .from('product_nfts')
      .select('serial_number')
      .eq('series_id', series_id)
      .order('serial_number', { ascending: false })
      .limit(1);

    if (lastError && lastError.code !== 'PGRST116') {
      throw lastError;
    }

    const startSerialNumber = lastNFT && lastNFT.length > 0 
      ? lastNFT[0].serial_number + 1 
      : 1;

    console.log(`📝 Starting from serial number: ${startSerialNumber}`);

    // Prepare batch insert data
    const nftsToInsert = [];
    for (let i = 0; i < quantity; i++) {
      const serial_number = startSerialNumber + i;
      const verify_code = generateVerifyCode();
      const url = uri.image || uri.url || uri;

      nftsToInsert.push({
        series_id,
        serial_number,
        uri: typeof uri === 'string' ? uri : JSON.stringify(uri),
        url,
        verify_code,
        is_collected: false,
        wallet_collector: null,
        created_at: new Date().toISOString()
      });
    }

    // Batch insert
    const { data, error } = await supabase
      .from('product_nfts')
      .insert(nftsToInsert)
      .select();

    if (error) throw error;

    console.log(`✅ Successfully minted ${data.length} NFTs`);

    // Format response
    const responseNFTs = data.map(nft => ({
      id: nft.id,
      series_id: nft.series_id,
      serial_number: nft.serial_number,
      verify_url: `${process.env.BASE_URL || 'https://snap-backend-0ewf.onrender.com'}/api/verify?series=${nft.series_id}&serialNumber=${nft.serial_number}`,
      url: nft.url,
      verify_code: nft.verify_code,
      is_collected: nft.is_collected,
      created_at: nft.created_at
    }));

    res.status(201).json({
      success: true,
      message: `${quantity} NFT minted successfully`,
      data: {
        series_id,
        quantity,
        serial_range: {
          start: startSerialNumber,
          end: startSerialNumber + quantity - 1
        },
        nfts: responseNFTs
      }
    });

  } catch (error) {
    console.error('❌ Mint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mint NFT series',
      details: error.message
    });
  }
}

// GET /api/nfts
async function getAllNFTs(req, res) {
  try {
    const { 
      series_id, 
      is_collected, 
      wallet_collector,
      page = 1, 
      limit = 50 
    } = req.query;

    let query = supabase
      .from('product_nfts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (series_id) {
      query = query.eq('series_id', series_id);
    }

    if (is_collected !== undefined) {
      query = query.eq('is_collected', is_collected === 'true');
    }

    if (wallet_collector) {
      query = query.eq('wallet_collector', wallet_collector);
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    query = query.range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Format response
    const formattedNFTs = data.map(nft => ({
      id: nft.id,
      series_id: nft.series_id,
      serial_number: nft.serial_number,
      verify_url: `${process.env.BASE_URL || 'https://snap-backend-0ewf.onrender.com'}/api/verify?series=${nft.series_id}&serialNumber=${nft.serial_number}`,
      url: nft.url,
      is_collected: nft.is_collected,
      wallet_collector: nft.wallet_collector,
      created_at: nft.created_at
    }));

    res.status(200).json({
      success: true,
      data: formattedNFTs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        total_pages: Math.ceil(count / limitNum)
      }
    });

  } catch (error) {
    console.error('❌ Fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch NFTs',
      details: error.message
    });
  }
}

// GET /api/nfts/series/:series_id/stats
async function getSeriesStats(req, res) {
  try {
    const { series_id } = req.params;

    const { data, error } = await supabase
      .from('product_nfts')
      .select('is_collected, wallet_collector')
      .eq('series_id', series_id);

    if (error) throw error;

    const totalMinted = data.length;
    const totalCollected = data.filter(nft => nft.is_collected).length;
    const totalAvailable = totalMinted - totalCollected;
    const uniqueCollectors = new Set(data.filter(nft => nft.wallet_collector).map(nft => nft.wallet_collector)).size;

    res.status(200).json({
      success: true,
      series_id,
      stats: {
        total_minted: totalMinted,
        total_collected: totalCollected,
        total_available: totalAvailable,
        unique_collectors: uniqueCollectors,
        collection_rate: totalMinted > 0 ? ((totalCollected / totalMinted) * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch series stats',
      details: error.message
    });
  }
}

module.exports = {
  mintNFT,
  getAllNFTs,
  getSeriesStats
};