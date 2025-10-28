require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config();

// Environment variables - optional for localhost
const { SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    // Tek compiler kullan, Debug hatasını önle
    version: "0.8.28",
    settings: {
      optimizer: { 
        enabled: true, 
        runs: 200 
      },
      viaIR: true,
      // Debug hatasını önle
      evmVersion: "paris",
      // Debug event'lerini tamamen devre dışı bırak
      debug: {
        revertStrings: "strip"
      },
      // ENS hatasını önle
      outputSelection: {
        "*": {
          "*": [
            "abi",
            "evm.bytecode",
            "evm.deployedBytecode",
            "evm.methodIdentifiers"
          ],
          "": ["ast"]
        }
      }
    },
  },

  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      // ENS hatasını önle
      ens: false,
      accounts: [
        // Owner/Restaurant için (Account #0)
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        
        // Customer için (Account #2)
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"  // 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
      ]
    }, 
    sepolia: {
      url: "https://ethereum-sepolia.rpc.subquery.network/public",
      accounts: [
        "0x77526f6c8f3c622eef7d0c9cf5c093abe24026c73974e9b76d79eac4f642fc3b"
      ],
      chainId: 11155111,
      gas: 2100000,
      gasPrice: 8000000000,
      timeout: 120000,
      // verify: {
      //   etherscan: {
      //     apiUrl: "https://api-sepolia.etherscan.io"
      //   }
      // }
    },
    /*
    sepolia_alt: {
      url: "https://ethereum-sepolia.publicnode.com",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [
        "77526f6c8f3c622eef7d0c9cf5c093abe24026c73974e9b76d79eac4f642fc3b"
      ],
      chainId: 11155111,
      gas: 2100000,
      gasPrice: 8000000000,
      timeout: 120000,
    },*/
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY || "",
  },
};
