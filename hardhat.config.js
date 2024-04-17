// require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("dotenv").config();
require("solidity-coverage");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
      sepolia: process.env.ETHERSCANSCAN_API_KEY
    }
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.ETH_TESTNET_RPC,
      accounts: [process.env.ETH_TEST_ACCOUNT],
    },
    mumbai: {
      url: process.env.POLY_TESTNET_RPC,
      accounts: [process.env.POLY_TEST_ACCOUNT],
    },
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      },
    },
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
    tests: "./test",
    cache: "./cache"
  },
};
