const { BN } = require("../config/blockchain");
const aave = require("../config/aave.json");
const { tokens } = require("../data/tokens.js");
const { getDiff } = require("../utils/swapsUtilities");
const { newZap } = require("../utils/newZap");

async function main() {
  const TYPE = "public";
  const USDT = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";
  const USDC = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
  const ONE = BN.from("1000000000000000000");
  const HALF = BN.from("500000000000000000");
  const WMATIC = aave.polygon.iWeth.address;
  try {
    for (let i = 0; i < tokens.length; i++) {
      const paths = [
        [WMATIC, tokens[i]],
        [WMATIC, USDT, tokens[i]],
        [WMATIC, USDC, tokens[i]],
      ];

      const AMOUNT = ONE.mul(14);

      const params = {
        tokenIn: WMATIC,
        tokenOut: tokens[i],
        fee: 3000,
        amountIn: AMOUNT,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
      };

      for (let j = 0; j < paths.length; j++) {
        const { firstDex, secondDex, thirdDex } = await getDiff(AMOUNT, paths[j], params, i, TYPE);

        if (firstDex != secondDex) {
          await newZap(firstDex, secondDex, AMOUNT, paths[j], TYPE);
        }

        if (firstDex != thirdDex) {
          await newZap(firstDex, thirdDex, AMOUNT, paths[j], TYPE);
        }

        if (secondDex != thirdDex) {
          await newZap(secondDex, thirdDex, AMOUNT, paths[j], TYPE);
        }
      }
    }
    main();
  } catch (error) {
    console.log("Something went wrong: ", error.reason);
    console.log("waiting for network...");
    setTimeout(() => {
      main();
    }, 1000);
  }
}

main();
