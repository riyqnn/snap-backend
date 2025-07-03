const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

class PinataService {
  async uploadFile(fileBuffer, fileName) {
    try {
      const options = {
        pinataMetadata: { name: fileName },
        pinataOptions: { cidVersion: 0 }
      };
      const result = await pinata.pinFileToIPFS(fileBuffer, options);
      return result.IpfsHash;
    } catch (error) {
      throw new Error(`Failed to upload file to Pinata: ${error.message}`);
    }
  }

  async uploadJSON(jsonData, fileName) {
    try {
      const options = {
        pinataMetadata: { name: fileName },
        pinataOptions: { cidVersion: 0 }
      };
      const result = await pinata.pinJSONToIPFS(jsonData, options);
      return result.IpfsHash;
    } catch (error) {
      throw new Error(`Failed to upload JSON to Pinata: ${error.message}`);
    }
  }
}

module.exports = new PinataService();