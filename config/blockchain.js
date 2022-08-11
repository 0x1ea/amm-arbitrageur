require("dotenv").config();
const { ethers, BigNumber } = require("ethers");
const config = require("./config.json");

const CHAIN = "polygon";
const MY_ACCOUNT = config.keys.private;
const HTTP_URL_LOCAL = config.rpcUrl[CHAIN].local;
const HTTP_URL_PUBLIC = config.rpcUrl[CHAIN].public;
const HTTP_URL_PRIVATE = config.rpcUrl[CHAIN].alchemy;

const BN = BigNumber;
const provider = {
  local: new ethers.providers.JsonRpcProvider(process.env[HTTP_URL_LOCAL]),
  public: new ethers.providers.JsonRpcProvider(process.env[HTTP_URL_PUBLIC]),
  private: new ethers.providers.JsonRpcProvider(process.env[HTTP_URL_PRIVATE]),
};

const deployer = {
  local: new ethers.Wallet(process.env[MY_ACCOUNT], provider.local),
  public: new ethers.Wallet(process.env[MY_ACCOUNT], provider.public),
  private: new ethers.Wallet(process.env[MY_ACCOUNT], provider.private),
};

// const localProvider = new ethers.providers.JsonRpcProvider(process.env[HTTP_URL_LOCAL]);
// const publicProvider = new ethers.providers.JsonRpcProvider(process.env[HTTP_URL_PUBLIC]);
// const privateProvider = new ethers.providers.JsonRpcProvider(
//   process.env[HTTP_URL_PRIVATE]
// );

// const localDeployer = new ethers.Wallet(process.env[MY_ACCOUNT], provider);
// const publicDeployer = new ethers.Wallet(process.env[MY_ACCOUNT], provider);
// const privateDeployer = new ethers.Wallet(process.env[MY_ACCOUNT], provider);

module.exports = { provider, deployer, BN, ethers };
