const { BN, deployer, provider, ethers } = require("../config/blockchain");
const aave = require("../config/aave.json");
const tokens = require("../data/tokens.json");
const {
  getDiff,
  getExpectedOutput,
  getTokenBalance,
  getTokenData,
  getExchanges,
} = require("../utils/swapsUtilities");

async function main() {
  const ONE = BN.from("1000000000000000000");
  const HALF = BN.from("500000000000000000");
  const WMATIC_ADDRESS = aave.polygon.iWeth.address;
  const exchanges = await getExchanges();

  for (let i = 0; i < tokens.length; i++) {
    const config = {
      amount: ONE.mul(1),
      token0: WMATIC_ADDRESS,
      token1: tokens[i],
    };

    const params = {
      tokenIn: config.token0,
      tokenOut: config.token1,
      fee: 3000,
      recipient: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      deadline: "99999999999999",
      amountIn: config.amount,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    };

    const { firstDex, secondDex } = await getDiff(config, params, i);

    await getExpectedOutput(firstDex, secondDex, config, params);
  }
}

main();
