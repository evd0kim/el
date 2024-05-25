require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",

  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/tqZmATdeA9bWPDLzmW40Gc3dwmhB2Ef9",
      accounts: {
        mnemonic: process.env.MNEMONIC
      },
    }
  }
};