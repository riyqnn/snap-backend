const path = require('path'); // ✅ hanya sekali di sini
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const fs = require('fs');
const pinataSDK = require('@pinata/sdk');
const streamifier = require('streamifier');

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

async function upload() {
  try {
    // === STEP 1: Upload Gambar ===
    const filePath = path.join(__dirname, 'logo.png'); // pastikan file ini ada
    const fileBuffer = fs.readFileSync(filePath);
    const readableStream = streamifier.createReadStream(fileBuffer);

    const fileResult = await pinata.pinFileToIPFS(readableStream, {
      pinataMetadata: { name: 'contoh_logo' },
      pinataOptions: { cidVersion: 0 }
    });

    const imageCID = fileResult.IpfsHash;
    console.log('✅ Gambar uploaded:', imageCID);

    // === STEP 2: Buat Metadata JSON ===
    const metadata = {
      name: 'Brand_Erigo',
      description: 'Ini adalah brand Erigo asli',
      image: `https://gateway.pinata.cloud/ipfs/${imageCID}`,
      attributes: [
        { trait_type: 'verified', value: 'Yes' },
        { trait_type: 'registrationDate', value: '2025-07-03' }
      ]
    };

    const jsonResult = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: { name: 'metadata_erigo.json' },
      pinataOptions: { cidVersion: 0 }
    });

    const jsonCID = jsonResult.IpfsHash;
    console.log('✅ Metadata uploaded:', jsonCID);

    // === DONE ===
    console.log('\n📦 Hasil akhir:');
    console.log('🖼️ Image CID:', imageCID);
    console.log('📄 Metadata CID:', jsonCID);
    console.log('🔗 Metadata URI:', `ipfs://${jsonCID}`);
  } catch (err) {
    console.error('❌ Gagal upload:', err.message);
  }
}

upload();
