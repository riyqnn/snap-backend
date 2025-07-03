const ethers = require('ethers');
const { initializeContract } = require('../utils/contract');
const { uploadToPinata } = require('../utils/pinata');
require('dotenv').config();

// Validate private key format
const validatePrivateKey = (privateKey) => {
    if (!privateKey) {
        throw new Error('PRIVATE_KEY is not set in environment variables');
    }
    const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
        throw new Error('Invalid PRIVATE_KEY format: must be a 64-character hexadecimal string');
    }
    return privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
};

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://testnet-rpc.monad.xyz');
try {
    const privateKey = validatePrivateKey(process.env.PRIVATE_KEY);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = initializeContract(wallet);

    // Middleware to verify owner
    const isOwner = async (req, res, next) => {
        try {
            const contractOwner = await contract.owner();
            if (contractOwner.toLowerCase() !== wallet.address.toLowerCase()) {
                return res.status(403).json({ error: 'Unauthorized: Not contract owner' });
            }
            next();
        } catch (error) {
            res.status(500).json({ error: 'Failed to verify owner' });
        }
    };

    exports.verifyBrand = async (req, res) => {
        const { brandName, description, logoUrl, website, userAddress } = req.body;
        if (!brandName || !description || !logoUrl || !website || !userAddress) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        try {
            const isAlreadyVerified = await contract.isVerified(userAddress);
            if (isAlreadyVerified) {
                return res.status(400).json({ error: 'Brand already verified' });
            }

            // Prepare metadata
            const metadata = {
                name: brandName,
                description,
                image: logoUrl,
                website,
                verificationDate: new Date().toISOString(),
            };

            // Upload metadata to Pinata
            const metadataURI = await uploadToPinata(metadata, `${brandName}_metadata.json`);

            // Verify brand on blockchain
            const tx = await contract.connect(wallet).verifyBrand(metadataURI, {
                value: ethers.parseEther('0.0001'),
                from: userAddress,
            });
            const receipt = await tx.wait();

            res.status(200).json({
                success: true,
                transactionHash: receipt.hash,
                tokenId: receipt.logs[0].topics[3], // Extract tokenId from Transfer event
                metadataURI,
            });
        } catch (error) {
            res.status(500).json({ error: error.reason || 'Failed to verify brand' });
        }
    };

    exports.isVerified = async (req, res) => {
        try {
            const isVerified = await contract.isVerified(req.params.address);
            res.status(200).json({ isVerified });
        } catch (error) {
            res.status(500).json({ error: 'Failed to check verification status' });
        }
    };

    exports.getTokenURI = async (req, res) => {
        try {
            const tokenURI = await contract.tokenURI(req.params.tokenId);
            res.status(200).json({ tokenURI });
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve token URI' });
        }
    };

    exports.setTokenURI = [isOwner, async (req, res) => {
        const { tokenId, newURI } = req.body;
        if (!tokenId || !newURI) {
            return res.status(400).json({ error: 'Token ID and new URI are required' });
        }

        try {
            const tx = await contract.setTokenURI(tokenId, newURI);
            const receipt = await tx.wait();
            res.status(200).json({ success: true, transactionHash: receipt.hash });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update token URI' });
        }
    }];

    exports.withdraw = [isOwner, async(opt, res) => {
        try {
            const balance = await contract.contractBalance();
            if (balance === 0n) {
                return res.status(400).json({ error: 'No funds to withdraw' });
            }
            const tx = await contract.withdraw();
            const receipt = await tx.wait();
            res.status(200).json({ success: true, transactionHash: receipt.hash });
        } catch (error) {
            res.status(500).json({ error: 'Failed to withdraw funds' });
        }
    }];

    exports.getContractBalance = async (req, res) => {
        try {
            const balance = await contract.contractBalance();
            res.status(200).json({ balance: ethers.formatEther(balance) });
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve contract balance' });
        }
    };
} catch (error) {
    console.error('Failed to initialize wallet:', error.message);
    throw error;
}