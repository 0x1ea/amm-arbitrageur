require("dotenv").config();
const { ethers, BigNumber } = require("ethers");
const config = require("./config.json");

const CHAIN = "polygon";
const MY_ACCOUNT = config.keys.fake;
const HTTP_URL = config.rpcUrl[CHAIN].alchemy;

const BN = BigNumber;
const provider = new ethers.providers.JsonRpcProvider(process.env[HTTP_URL]);
const deployer = new ethers.Wallet(process.env[MY_ACCOUNT], provider);

module.exports = { provider, deployer, BN, ethers };
