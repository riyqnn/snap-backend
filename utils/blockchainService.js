const { initializeContract } = require('../config/contractConfig');
const ethers = require('ethers');

class BlockchainService {
  async verifyBrand(metadataURI, wallet, value) {
    try {
      const contract = initializeContract(wallet);
      const tx = await contract.verifyBrand(metadataURI, {
        value: ethers.utils.parseEther(value.toString()),
        gasLimit: 100000 // Adjust gas limit as needed
      });
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      throw new Error(`Failed to verify brand: ${error.message}`);
    }
  }
}

module.exports = new BlockchainService();