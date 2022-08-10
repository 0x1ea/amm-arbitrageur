const { deployer, ethers } = require("../config/blockchain");
const dexes = require("../config/dexes.json");
const aave = require("../config/aave.json");

const WRAPPER_ABI = aave.polygon.iWeth.abi;

async function getDiff(config, params, i) {
  const exchanges = await getExchanges();
  let firstDex, secondDex;

  const { decimals, symbol } = await getTokenData(config.token1, deployer);
  console.log(`\nId: ${i}, Symbol: ${symbol}`);

  try {
    let amountOut1 = await exchanges.quick.getAmountsOut(config.amount, [
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
    let amountOut2 = await exchanges.sushi.getAmountsOut(config.amount, [
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
    let amountOut3 = await exchanges.uniQuoter.callStatic.quoteExactInputSingle(
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
    let amountOut4 = await exchanges.ape.getAmountsOut(config.amount, [
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

    console.log("ape   amountOut4", ethers.utils.formatUnits(amountOut4[1], decimals));
  } catch (error) {
    console.log("No hay ese par en apeswap");
  }

  try {
    let amountOut5 = await exchanges.dfyn.getAmountsOut(config.amount, [
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

    console.log("dfyn  amountOut5", ethers.utils.formatUnits(amountOut5[1], decimals));
  } catch (error) {
    console.log("No hay ese par en dfyn");
  }

  console.log("FirstDex:", firstDex);
  console.log("SecondDex:", secondDex);

  return { firstDex, secondDex };
}

async function getExpectedOutput(firstDex, secondDex, config, params) {
  const amount = config.amount;
  const token0 = config.token0;
  const token1 = config.token1;
  const exchanges = await getExchanges();

  let amountOut1, amountOut2, amountInDex, amountTemp, finalAmount;

  try {
    if (
      firstDex == "uni" &&
      (secondDex == "sushi" ||
        secondDex == "quick" ||
        secondDex == "ape" ||
        secondDex == "dfyn")
    ) {
      amountOut1 = await exchanges.uniQuoter.callStatic.quoteExactInputSingle(
        params.tokenIn,
        params.tokenOut,
        params.fee,
        params.amountIn,
        params.sqrtPriceLimitX96
      );
      amountOut2 = await exchanges[secondDex].getAmountsOut(amountOut1, [token1, token0]);

      amountInDex = ethers.utils.formatUnits(params.amountIn, 18);
      amountTemp = ethers.utils.formatUnits(amountOut2[0], 18);
      finalAmount = ethers.utils.formatUnits(amountOut2[1], 18);
    }

    if (
      (firstDex == "quick" ||
        firstDex == "sushi" ||
        firstDex == "ape" ||
        firstDex == "dfyn") &&
      (secondDex == "quick" ||
        secondDex == "sushi" ||
        secondDex == "ape" ||
        secondDex == "dfyn")
    ) {
      amountOut1 = await exchanges[firstDex].getAmountsOut(amount, [token0, token1]);
      amountOut2 = await exchanges[secondDex].getAmountsOut(amountOut1[1], [
        token1,
        token0,
      ]);

      amountInDex = ethers.utils.formatUnits(amountOut1[0], 18);
      amountTemp = ethers.utils.formatUnits(amountOut2[0], 18);
      finalAmount = ethers.utils.formatUnits(amountOut2[1], 18);
    }

    if (
      (firstDex == "quick" ||
        firstDex == "sushi" ||
        firstDex == "ape" ||
        firstDex == "dfyn") &&
      secondDex == "uni"
    ) {
      amountOut1 = await exchanges[firstDex].getAmountsOut(amount, [token0, token1]);
      amountOut2 = await exchanges.uniQuoter.callStatic.quoteExactInputSingle(
        params.tokenIn,
        params.tokenOut,
        params.fee,
        amountOut1[1],
        params.sqrtPriceLimitX96
      );

      amountInDex = ethers.utils.formatUnits(amountOut1[0], 18);
      amountTemp = ethers.utils.formatUnits(amountOut1[1], 18);
      finalAmount = ethers.utils.formatUnits(amountOut2, 18);
    }

    console.log(
      `${parseFloat(amountInDex).toFixed(8)} --${firstDex}--> ${parseFloat(
        amountTemp
      ).toFixed(8)} --${secondDex}--> ${parseFloat(finalAmount).toFixed(8)}`
    );
  } catch (error) {
    console.log("Error consiguiendo la ruta de swaps");
  }
}

async function getTokenBalance(tokenContract, account) {
  const balance = await tokenContract.balanceOf(account.address);
  const symbol = await tokenContract.symbol();
  const decimals = await tokenContract.decimals();
  console.log(`${symbol} balance: ${ethers.utils.formatUnits(balance, decimals)}`);
  return { balance, symbol, decimals };
}

async function getTokenData(tokenAddress, deployer) {
  const tokenContract = new ethers.Contract(tokenAddress, WRAPPER_ABI, deployer);
  const balance = await tokenContract.balanceOf(deployer.address);
  const symbol = await tokenContract.symbol();
  const decimals = await tokenContract.decimals();
  return { balance, symbol, decimals };
}

async function getExchanges() {
  const sushi = new ethers.Contract(
    dexes.polygon.sushiRouter.address,
    dexes.polygon.sushiRouter.abi,
    deployer
  );

  const quick = new ethers.Contract(
    dexes.polygon.quickRouter.address,
    dexes.polygon.quickRouter.abi,
    deployer
  );

  const uni = new ethers.Contract(
    dexes.polygon.uni3Router.address,
    dexes.polygon.uni3Router.abi,
    deployer
  );

  const uniQuoter = new ethers.Contract(
    dexes.polygon.uniQuoter.address,
    dexes.polygon.uniQuoter.abi,
    deployer
  );

  const dfyn = new ethers.Contract(
    dexes.polygon.dfyn.address,
    dexes.polygon.dfyn.abi,
    deployer
  );

  const ape = new ethers.Contract(
    dexes.polygon.ape.address,
    dexes.polygon.ape.abi,
    deployer
  );

  return { sushi, quick, uni, uniQuoter, dfyn, ape };
}

module.exports = {
  getDiff,
  getExpectedOutput,
  getTokenBalance,
  getTokenData,
  getExchanges,
};
