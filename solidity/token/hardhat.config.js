require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",

  networks: {
    sepolia: {
      url: process.env.ALCHEMY,
      accounts: {
        mnemonic: process.env.MNEMONIC
      },
    }
  }
};