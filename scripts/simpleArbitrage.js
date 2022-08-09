const { BN, deployer, provider, ethers } = require("../config/blockchain");
const dexes = require("../config/dexes.json");
const aave = require("../config/aave.json");
const tokens = require("../config/tokens.json");
const {
  getDiff,
  getExpectedOutput,
  getTokenBalance,
  getTokenData,
  getExchanges,
} = require("../utils/swapsUtilities");

async function main() {
  const ONE = BN.from("1000000000000000000");
  const WMATIC_ADDRESS = aave.polygon.iWeth.address;

  const exchanges = await getExchanges();
  for (let i = 0; i < tokens.length; i++) {
    const config = {
      amount: ONE.mul(1),
      token0: WMATIC_ADDRESS,
      token1: tokens[i],
      exchanges,
    };

    let amountOut1,
      amountOut2,
      amountOut3,
      amountOut4,
      amountOut5,
      firstDex,
      secondDex,
      minAmount,
      maxAmount;

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

    const { decimals, symbol } = await getTokenData(config.token1, deployer);
    console.log(`\nId: ${i},Symbol: ${symbol}`);

    try {
      amountOut1 = await exchanges.quick.getAmountsOut(config.amount, [
        config.token0,
        config.token1,
      ]);

      let amountOut = ethers.utils.formatUnits(amountOut1[1], decimals);
      amountOut = parseFloat(amountOut).toFixed(8);

      console.log("quick amountOut1", ethers.utils.formatUnits(amountOut1[1], decimals));

      firstDex = "quick";
      secondDex = "quick";
      minAmount = amountOut;
      maxAmount = amountOut;
    } catch (error) {
      console.log("No hay ese par en quickswap");
    }

    try {
      amountOut2 = await exchanges.sushi.getAmountsOut(config.amount, [
        config.token0,
        config.token1,
      ]);
      let amountOut = ethers.utils.formatUnits(amountOut2[1], decimals);
      amountOut = parseFloat(amountOut).toFixed(8);

      if (!maxAmount || amountOut > maxAmount) {
        maxAmount = amountOut;
        firstDex = "sushi";
      }

      if (!minAmount || amountOut < minAmount) {
        minAmount = amountOut;
        secondDex = "sushi";
      }

      console.log("sushi amountOut2", ethers.utils.formatUnits(amountOut2[1], decimals));
    } catch (error) {
      console.log("No hay ese par en sushiswap");
    }

    try {
      amountOut3 = await exchanges.uniQuoter.callStatic.quoteExactInputSingle(
        params.tokenIn,
        params.tokenOut,
        params.fee,
        params.amountIn,
        params.sqrtPriceLimitX96
      );
      let amountOut = ethers.utils.formatUnits(amountOut3, decimals);
      amountOut = parseFloat(amountOut).toFixed(8);

      if (!maxAmount || amountOut > maxAmount) {
        maxAmount = amountOut;
        firstDex = "uni";
      }

      if (!minAmount || amountOut < minAmount) {
        minAmount = amountOut;
        secondDex = "uni";
      }
      console.log("uni   amountOut3", ethers.utils.formatUnits(amountOut3, decimals));
    } catch (error) {
      console.log("No hay ese par en uniswap");
    }

    try {
      amountOut4 = await exchanges.ape.getAmountsOut(config.amount, [
        config.token0,
        config.token1,
      ]);
      let amountOut = ethers.utils.formatUnits(amountOut4[1], decimals);
      amountOut = parseFloat(amountOut).toFixed(8);

      if (!maxAmount || amountOut > maxAmount) {
        maxAmount = amountOut;
        firstDex = "ape";
      }

      if (!minAmount || amountOut < minAmount) {
        minAmount = amountOut;
        secondDex = "ape";
      }

      console.log("ape amountOut4", ethers.utils.formatUnits(amountOut4[1], decimals));
    } catch (error) {
      console.log("No hay ese par en apeswap");
    }

    try {
      amountOut5 = await exchanges.dfyn.getAmountsOut(config.amount, [
        config.token0,
        config.token1,
      ]);
      let amountOut = ethers.utils.formatUnits(amountOut5[1], decimals);
      amountOut = parseFloat(amountOut).toFixed(8);

      if (!maxAmount || amountOut > maxAmount) {
        maxAmount = amountOut;
        firstDex = "dfyn";
      }

      if (!minAmount || amountOut < minAmount) {
        minAmount = amountOut;
        secondDex = "dfyn";
      }

      console.log("dfyn amountOut5", ethers.utils.formatUnits(amountOut5[1], decimals));
    } catch (error) {
      console.log("No hay ese par en dfyn");
    }

    console.log("FirstDex:", firstDex);
    console.log("SecondDex:", secondDex);

    const expectedOutput = await getExpectedOutput(firstDex, secondDex, config, params);
  }
}

main();
