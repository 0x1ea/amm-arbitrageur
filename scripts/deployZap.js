const { deployer, ethers } = require("../config/blockchain");
const metadata = require("../artifacts/contracts/Zap2.sol/Zap2.json");
require("dotenv").config();
const aave = require("../config/aave.json");

const CHAIN = "polygon";
const TYPE = "local";
const WETH_ADDRESS = aave[CHAIN].iWeth.address;

async function deploy() {
  // Deploy the contract
  const factory = new ethers.ContractFactory(metadata.abi, metadata.bytecode, deployer[TYPE]);

  const contract = await factory.deploy(WETH_ADDRESS /* , { gasPrice: "35000000000" } */);
  await contract.deployed();
  console.log(`Deployment successful! Contract Address: ${contract.address}`);
}

deploy();
