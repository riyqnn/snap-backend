const ethers = require('ethers');
require('dotenv').config();

const contractABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "metadataURI",
        "type": "string"
      }
    ],
    "name": "verifyBrand",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

exports.initializeContract = (wallet) => {
    if (!process.env.CONTRACT_ADDRESS) {
        throw new Error('CONTRACT_ADDRESS is not set in environment variables');
    }
    return new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
};