const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

// Upload file to Pinata
async function uploadFileToIPFS(filePath, fileName) {
  try {
    const readableStreamForFile = fs.createReadStream(filePath);
    
    const options = {
      pinataMetadata: {
        name: fileName,
        keyvalues: {
          uploadedAt: new Date().toISOString()
        }
      },
      pinataOptions: {
        cidVersion: 0
      }
    };

    const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
    
    return {
      success: true,
      ipfsHash: result.IpfsHash,
      url: `https://indigo-legislative-mackerel-269.mypinata.cloud/ipfs/${result.IpfsHash}`
    };
  } catch (error) {
    console.error('❌ Pinata upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Upload JSON metadata to Pinata
async function uploadJSONToIPFS(jsonData, fileName) {
  try {
    const options = {
      pinataMetadata: {
        name: fileName,
        keyvalues: {
          type: 'metadata',
          uploadedAt: new Date().toISOString()
        }
      }
    };

    const result = await pinata.pinJSONToIPFS(jsonData, options);
    
    return {
      success: true,
      ipfsHash: result.IpfsHash,
      url: `https://indigo-legislative-mackerel-269.mypinata.cloud/ipfs/${result.IpfsHash}`
    };
  } catch (error) {
    console.error('❌ Pinata JSON upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  uploadFileToIPFS,
  uploadJSONToIPFS
};