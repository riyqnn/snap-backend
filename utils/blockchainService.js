const { ethers, parseEther } = require('ethers');
const { initializeContract } = require('../config/contractConfig');

class BlockchainService {
  async verifyBrand(metadataURI, signer, value) {
    try {
      const contract = initializeContract(signer);
      const tx = await contract.verifyBrand(metadataURI, {
        value: parseEther(value.toString()),
        gasLimit: 100000
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

  async isVerified(address, signer) {
    try {
      const contract = initializeContract(signer);
      const result = await contract.isVerified(address);
      return result;
    } catch (error) {
      throw new Error(`Failed to check verification status: ${error.message}`);
    }
  }

  async createSeries(seriesId, maxSupply, brandOwner, signer) {
    try {
      const contract = initializeContract(signer);
      const tx = await contract.createSeries(seriesId, maxSupply, brandOwner, {
        gasLimit: 150000
      });
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      throw new Error(`Failed to create series: ${error.message}`);
    }
  }
}

module.exports = new BlockchainService();
