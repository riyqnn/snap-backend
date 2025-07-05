const path = require('path');
const fs = require('fs');
const streamifier = require('streamifier');
const pinataSDK = require('@pinata/sdk');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

async function testUploadBrand(filePathInput, brandName, description, registrationDate) {
  try {
    if (!filePathInput || !brandName || !description || !registrationDate) {
      console.error('❌ Input tidak lengkap.');
      console.log('Contoh pemakaian:\nnode testBrandUpload.js ./logo.jpg "Erigo" "Brand lokal terbaik" "2025-07-03"');
      process.exit(1);
    }

    const filePath = path.resolve(filePathInput);
    const fileBuffer = fs.readFileSync(filePath);
    const readableStream = streamifier.createReadStream(fileBuffer);

    // Step 1: Upload Image
    const imageResult = await pinata.pinFileToIPFS(readableStream, {
      pinataMetadata: { name: `${brandName}_logo` },
      pinataOptions: { cidVersion: 0 }
    });

    const imageCID = imageResult.IpfsHash;
    console.log('✅ Logo berhasil diupload:', imageCID);

    // Step 2: Create Metadata JSON
    const metadata = {
      name: `Brand_${brandName}`,
      description,
      image: `https://gateway.pinata.cloud/ipfs/${imageCID}`,
      attributes: [
        { trait_type: 'verified', value: 'Yes' },
        { trait_type: 'registrationDate', value: registrationDate }
      ]
    };

    // Step 3: Upload Metadata JSON
    const metadataResult = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: { name: `${brandName}_metadata.json` },
      pinataOptions: { cidVersion: 0 }
    });

    const jsonCID = metadataResult.IpfsHash;
    console.log('✅ Metadata berhasil diupload:', jsonCID);

    // Final Output
    console.log('\n📦 Hasil Upload Brand');
    console.log('🖼️ Image CID     :', imageCID);
    console.log('📄 Metadata CID  :', jsonCID);
    console.log('🔗 Metadata URI  :', `ipfs://${jsonCID}`);
    console.log('🌐 Metadata URL  :', `https://gateway.pinata.cloud/ipfs/${jsonCID}`);
  } catch (err) {
    console.error('❌ Gagal:', err.message);
  }
}

// Ambil input dari CLI
const [, , filePath, brandName, description, registrationDate] = process.argv;
testUploadBrand(filePath, brandName, description, registrationDate);
