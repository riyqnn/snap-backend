const supabase = require('../database/supabaseClient');

// GET /api/verify
async function getVerifyPage(req, res) {
  try {
    const { series, serialNumber } = req.query;

    if (!series || !serialNumber) {
      return res.status(400).json({
        success: false,
        error: 'series and serialNumber are required'
      });
    }

    // Get NFT data
    const { data, error } = await supabase
      .from('product_nfts')
      .select('*')
      .eq('series_id', series)
      .eq('serial_number', parseInt(serialNumber))
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }

    // Parse URI if it's a string
    let metadata = data.uri;
    if (typeof data.uri === 'string') {
      try {
        metadata = JSON.parse(data.uri);
      } catch (e) {
        // If parsing fails, keep as string
      }
    }

    res.status(200).json({
      success: true,
      message: 'NFT verification page',
      data: {
        id: data.id,
        series_id: data.series_id,
        serial_number: data.serial_number,
        metadata,
        url: data.url,
        is_collected: data.is_collected,
        wallet_collector: data.wallet_collector,
        created_at: data.created_at,
        verify_instructions: {
          step1: 'Enter the 6-digit verification code from your product',
          step2: 'Enter your wallet address',
          step3: 'Submit to claim your NFT'
        }
      }
    });

  } catch (error) {
    console.error('❌ Verify page error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load verification page',
      details: error.message
    });
  }
}

// POST /api/verify
async function claimNFT(req, res) {
  try {
    const { series_id, serial_number, verify_code, wallet_address } = req.body;

    if (!series_id || !serial_number || !verify_code || !wallet_address) {
      return res.status(400).json({
        success: false,
        error: 'series_id, serial_number, verify_code, and wallet_address are required'
      });
    }

    // Basic wallet address validation
    if (!wallet_address.startsWith('0x') || wallet_address.length !== 42) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    console.log(`🔐 Attempting to claim NFT: Series ${series_id}, Serial ${serial_number}`);

    // Get NFT data
    const { data: nft, error: fetchError } = await supabase
      .from('product_nfts')
      .select('*')
      .eq('series_id', series_id)
      .eq('serial_number', parseInt(serial_number))
      .single();

    if (fetchError || !nft) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }

    // Check if already collected
    if (nft.is_collected) {
      return res.status(400).json({
        success: false,
        error: 'NFT already collected',
        collected_by: nft.wallet_collector
      });
    }

    // Verify code
    if (nft.verify_code !== verify_code) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }

    // Update NFT as collected
    const { data: updatedNFT, error: updateError } = await supabase
      .from('product_nfts')
      .update({
        is_collected: true,
        wallet_collector: wallet_address,
        collected_at: new Date().toISOString()
      })
      .eq('id', nft.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ NFT claimed successfully by ${wallet_address}`);

    // Parse URI if it's a string
    let metadata = updatedNFT.uri;
    if (typeof updatedNFT.uri === 'string') {
      try {
        metadata = JSON.parse(updatedNFT.uri);
      } catch (e) {
        // If parsing fails, keep as string
      }
    }

    res.status(200).json({
      success: true,
      message: 'NFT claimed successfully!',
      data: {
        id: updatedNFT.id,
        series_id: updatedNFT.series_id,
        serial_number: updatedNFT.serial_number,
        metadata,
        url: updatedNFT.url,
        wallet_collector: updatedNFT.wallet_collector,
        collected_at: updatedNFT.collected_at,
        verify_url: `${process.env.BASE_URL || 'https://snap-backend-0ewf.onrender.com'}/api/verify?series=${updatedNFT.series_id}&serialNumber=${updatedNFT.serial_number}`
      }
    });

  } catch (error) {
    console.error('❌ Claim error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to claim NFT',
      details: error.message
    });
  }
}

module.exports = {
  getVerifyPage,
  claimNFT
};