const { BN, deployer, provider, ethers } = require("../config/blockchain");
const metadata = require("../artifacts/contracts/Swampert.sol/Swampert.json");
const aave = require("../config/aave.json");
const tokens = require("../data/tokens.json");
const dexes = require("../config/dexes.json");
const {
  getDiff,
  getExpectedOutput,
  getTokenBalance,
  getTokenData,
  getExchanges,
} = require("../utils/swapsUtilities");

const WMATIC_ADDRESS = aave.polygon.iWeth.address;
const ONE = BN.from("1000000000000000000");
const HALF = BN.from("500000000000000000");

const swampert = new ethers.Contract(
  "0x27081040aef2218553ce33bA1d4BC148c1b41fa3",
  metadata.abi,
  deployer
);

const path = [WMATIC_ADDRESS, tokens[10]];
const inversePath = [tokens[10], WMATIC_ADDRESS];

async function swapV3toV2() {
  const firstDex = dexes.polygon.uni3Router.address;
  const secondDex = dexes.polygon.ape.address;

  let balance = await deployer.getBalance();
  console.log("balance:", balance.toString());
  await swampert.fromV3ToV2(firstDex, secondDex, inversePath, {
    value: ONE,
  });
  const amountOut = await swampert.amountOut();
  console.log("amountOut:", amountOut.toString());

  await swapV2toV2();
}

async function swapV2toV2() {
  const firstDex = dexes.polygon.quickRouter.address;
  const secondDex = dexes.polygon.ape.address;

  let balance = await deployer.getBalance();
  console.log("balance:", balance.toString());

  await swampert.fromV2ToV2(firstDex, secondDex, path, inversePath, {
    value: ONE,
  });

  const amountOut = await swampert.amountOut();
  console.log("amountOut:", amountOut.toString());

  await swapV2toV3();
}

async function swapV2toV3() {
  const firstDex = dexes.polygon.ape.address;
  const secondDex = dexes.polygon.uni3Router.address;

  let balance = await deployer.getBalance();
  console.log("balance:", balance.toString());
  await swampert.fromV2ToV3(firstDex, secondDex, path, {
    value: ONE,
  });
  const amountOut = await swampert.amountOut();
  console.log("amountOut:", amountOut.toString());
}

swapV3toV2();
