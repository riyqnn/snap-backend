const { ethers } = require('ethers');
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
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isVerified",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

exports.initializeContract = (signer) => {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error('❌ CONTRACT_ADDRESS is not set in .env');
  }
  return new ethers.Contract(contractAddress, contractABI, signer);
};
