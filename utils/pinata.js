const pinataSDK = require('@pinata/sdk');
require('dotenv').config();

const validatePinataCredentials = () => {
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_KEY) {
        throw new Error('PINATA_API_KEY or PINATA_SECRET_KEY is not set in environment variables');
    }
};

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

exports.uploadToPinata = async (metadata, fileName) => {
    validatePinataCredentials();
    try {
        const options = {
            pinataMetadata: {
                name: fileName,
            },
            pinataOptions: {
                cidVersion: 0,
            },
        };

        const result = await pinata.pinJSONToIPFS(metadata, options);
        return `ipfs://${result.IpfsHash}`;
    } catch (error) {
        throw new Error(`Failed to upload to Pinata: ${error.message}`);
    }
};