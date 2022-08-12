const { BN, deployer, provider, ethers } = require("../config/blockchain");
const aave = require("../config/aave.json");
const { tokens } = require("../data/tokens.js");
const { getDiff, getExpectedOutput } = require("../utils/swapsUtilities");
const { callZap } = require("../utils/callZap");

async function main() {
  const TYPE = "public";
  const ONE = BN.from("1000000000000000000");
  const HALF = BN.from("500000000000000000");
  const WMATIC_ADDRESS = aave.polygon.iWeth.address;
  try {
    for (let i = 0; i < tokens.length; i++) {
      const config = {
        amount: ONE.mul(10),
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

      const { firstDex, secondDex, thirdDex } = await getDiff(config, params, i, TYPE);

      let profitable;
      if (firstDex != secondDex) {
        profitable = await getExpectedOutput(firstDex, secondDex, config, params, TYPE);
        if (profitable) {
          await callZap(
            firstDex,
            secondDex,
            config.amount,
            config.token0,
            config.token1,
            "private"
          );
        }
      }

      if (firstDex != thirdDex) {
        profitable = await getExpectedOutput(firstDex, thirdDex, config, params, TYPE);
        if (profitable) {
          await callZap(
            firstDex,
            thirdDex,
            config.amount,
            config.token0,
            config.token1,
            "private"
          );
        }
      }

      if (secondDex != thirdDex) {
        profitable = await getExpectedOutput(secondDex, thirdDex, config, params, TYPE);
        if (profitable) {
          await callZap(
            secondDex,
            thirdDex,
            config.amount,
            config.token0,
            config.token1,
            "private"
          );
        }
      }
    }
    main();
  } catch (error) {
    console.log("Something went wrong: ", error.reason);
    console.log("waiting for network...");
    setTimeout(() => {
      main();
    }, 60000);
  }
}

main();
