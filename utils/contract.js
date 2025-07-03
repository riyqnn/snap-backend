const ethers = require('ethers');
require('dotenv').config();

const contractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
            "internalType": "address",
            "name": "brand",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "string",
            "name": "metadataURI",
            "type": "string"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
        }
    ],
    "name": "BrandVerified",
    "type": "event"
},
{
    "inputs": [],
    "name": "contractBalance",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
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
},
{
    "inputs": [
        {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
        },
        {
            "internalType": "string",
            "name": "newURI",
            "type": "string"
        }
    ],
    "name": "setTokenURI",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
    "inputs": [
        {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
        }
    ],
    "name": "tokenURI",
    "outputs": [
        {
            "internalType": "string",
            "name": "",
            "type": "string"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
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
    "inputs": [],
    "name": "owner",
    "outputs": [
        {
            "internalType": "address",
            "name": "",
            "type": "address"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
{
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
    "stateMutability": "payable",
    "type": "receive"
}
];

exports.initializeContract = (wallet) => {
    if (!process.env.CONTRACT_ADDRESS) {
        throw new Error('CONTRACT_ADDRESS is not set in environment variables');
    }
    return new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
};