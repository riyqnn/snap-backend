// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// const fs = require('fs');
// const pinataSDK = require('@pinata/sdk');
// const streamifier = require('streamifier');

// const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

// async function upload(filePathInput, brandName, description, registrationDate) {
//   try {
//     // Validasi input
//     if (!filePathInput || !brandName || !description || !registrationDate) {
//       console.error('❌ Input tidak lengkap.\nContoh: node uploadToPinata.js ./logo.png "Erigo" "Deskripsi..." "2025-07-03"');
//       process.exit(1);
//     }

//     const filePath = path.resolve(filePathInput);
//     const fileBuffer = fs.readFileSync(filePath);
//     const readableStream = streamifier.createReadStream(fileBuffer);

//     // === STEP 1: Upload Gambar ===
//     const fileResult = await pinata.pinFileToIPFS(readableStream, {
//       pinataMetadata: { name: `${brandName}_logo` },
//       pinataOptions: { cidVersion: 0 }
//     });

//     const imageCID = fileResult.IpfsHash;
//     console.log('✅ Gambar uploaded:', imageCID);

//     // === STEP 2: Buat Metadata JSON ===
//     const metadata = {
//       name: `Brand_${brandName}`,
//       description,
//       image: `https://gateway.pinata.cloud/ipfs/${imageCID}`,
//       attributes: [
//         { trait_type: 'verified', value: 'Yes' },
//         { trait_type: 'registrationDate', value: registrationDate }
//       ]
//     };

//     const jsonResult = await pinata.pinJSONToIPFS(metadata, {
//       pinataMetadata: { name: `${brandName}_metadata.json` },
//       pinataOptions: { cidVersion: 0 }
//     });

//     const jsonCID = jsonResult.IpfsHash;
//     console.log('✅ Metadata uploaded:', jsonCID);

//     // === DONE ===
//     console.log('\n📦 Hasil akhir:');
//     console.log('🖼️ Image CID:', imageCID);
//     console.log('📄 Metadata CID:', jsonCID);
//     console.log('🔗 Metadata URI:', `ipfs://${jsonCID}`);
//   } catch (err) {
//     console.error('❌ Gagal upload:', err.message);
//   }
// }

// // Ambil input dari terminal
// const [, , filePath, brandName, description, registrationDate] = process.argv;
// upload(filePath, brandName, description, registrationDate);
