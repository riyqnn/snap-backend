const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

class PinataService {
  async uploadFile(fileBuffer, fileName) {
    const options = {
      pinataMetadata: { name: fileName },
      pinataOptions: { cidVersion: 0 }
    };
    try {
      const readableStream = require('streamifier').createReadStream(fileBuffer);
      const result = await pinata.pinFileToIPFS(readableStream, options);
      return result.IpfsHash;
    } catch (error) {
      throw new Error(`Upload file failed: ${error.message}`);
    }
  }

  async uploadJSON(jsonData, fileName) {
    const options = {
      pinataMetadata: { name: fileName },
      pinataOptions: { cidVersion: 0 }
    };
    try {
      const result = await pinata.pinJSONToIPFS(jsonData, options);
      return result.IpfsHash;
    } catch (error) {
      throw new Error(`Upload JSON failed: ${error.message}`);
    }
  }
}

module.exports = new PinataService();
