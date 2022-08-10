const { deployer, provider, ethers } = require("../config/blockchain");
const metadata = require("../artifacts/contracts/Swampert.sol/Swampert.json");
require("dotenv").config();
const aave = require("../config/aave.json");

const CHAIN = "polygon";

const WETH_ADDRESS = aave[CHAIN].iWeth.address;

async function deploy() {
  // Deploy the contract
  const factory = new ethers.ContractFactory(metadata.abi, metadata.bytecode, deployer);

  const contract = await factory.deploy(WETH_ADDRESS);
  await contract.deployed();
  console.log(`Deployment successful! Contract Address: ${contract.address}`);
}

deploy();