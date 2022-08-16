const { deployer, ethers } = require("../config/blockchain");
const dexes = require("../config/dexes.json");
const aave = require("../config/aave.json");

const WRAPPER_ABI = aave.polygon.iWeth.abi;

async function getDiff(amount, path, params, i, type) {
  const exchanges = await getExchanges(type);
  let myDeployer = deployer[type];
  let firstDex, secondDex, thirdDex, minAmount, maxAmount, midAmount;

  const { decimals, symbol } = await getTokenData(params.tokenOut, myDeployer);
  console.log(`Id: ${i}, Symbol: ${symbol}, Address: ${params.tokenOut}`);

  try {
    let amountOut1 = await exchanges.quick.getAmountsOut(amount, path);

    let amountOut = ethers.utils.formatUnits(amountOut1[amountOut1.length - 1], decimals);
    amountOut = parseFloat(amountOut).toFixed(8);

    firstDex = "quick";
    secondDex = "quick";
    thirdDex = "quick";
    minAmount = amountOut;
    maxAmount = amountOut;
    // console.log(
    //   "quick amountOut:",
    //   ethers.utils.formatUnits(amountOut1[amountOut1.length - 1], decimals)
    // );
  } catch (error) {
    // console.log("quick amountOut: N/A");
  }

  try {
    let amountOut2 = await exchanges.sushi.getAmountsOut(amount, path);
    let amountOut = ethers.utils.formatUnits(amountOut2[amountOut2.length - 1], decimals);
    amountOut = parseFloat(amountOut).toFixed(8);

    if (!minAmount || amountOut < minAmount) {
      minAmount = amountOut;
      secondDex = "sushi";
    }

    if (!maxAmount || amountOut > maxAmount) {
      maxAmount = amountOut;
      firstDex = "sushi";
    }

    if (!midAmount || (amountOut > minAmount && amountOut < maxAmount)) {
      midAmount = amountOut;
      thirdDex = "sushi";
    }
    // console.log(
    //   "sushi amountOut:",
    //   ethers.utils.formatUnits(amountOut2[amountOut2.length - 1], decimals)
    // );
  } catch (error) {
    // console.log("sushi amountOut: N/A");
  }
  try {
    let amountOut2 = await exchanges.merkat.getAmountsOut(amount, path);
    let amountOut = ethers.utils.formatUnits(amountOut2[amountOut2.length - 1], decimals);
    amountOut = parseFloat(amountOut).toFixed(8);

    if (!minAmount || amountOut < minAmount) {
      minAmount = amountOut;
      secondDex = "merkat";
    }

    if (!maxAmount || amountOut > maxAmount) {
      maxAmount = amountOut;
      firstDex = "merkat";
    }

    if (!midAmount || (amountOut > minAmount && amountOut < maxAmount)) {
      midAmount = amountOut;
      thirdDex = "merkat";
    }
    // console.log(
    //   "merkat amountOut:",
    //   ethers.utils.formatUnits(amountOut2[amountOut2.length - 1], decimals)
    // );
  } catch (error) {
    // console.log("merkat amountOut: N/A");
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

    if (!minAmount || amountOut < minAmount) {
      minAmount = amountOut;
      secondDex = "uni";
    }

    if (!maxAmount || amountOut > maxAmount) {
      maxAmount = amountOut;
      firstDex = "uni";
    }

    if (!midAmount || (amountOut > minAmount && amountOut < maxAmount)) {
      midAmount = amountOut;
      thirdDex = "uni";
    }
    // console.log("uni   amountOut:", ethers.utils.formatUnits(amountOut3, decimals));
  } catch (error) {
    // console.log("uni   amountOut: N/A");
  }

  try {
    let amountOut4 = await exchanges.ape.getAmountsOut(amount, path);
    let amountOut = ethers.utils.formatUnits(amountOut4[amountOut4.length - 1], decimals);
    amountOut = parseFloat(amountOut).toFixed(8);

    if (!minAmount || amountOut < minAmount) {
      minAmount = amountOut;
      secondDex = "ape";
    }

    if (!maxAmount || amountOut > maxAmount) {
      maxAmount = amountOut;
      firstDex = "ape";
    }

    if (!midAmount || (amountOut > minAmount && amountOut < maxAmount)) {
      midAmount = amountOut;
      thirdDex = "ape";
    }
    // console.log(
    //   "ape   amountOut:",
    //   ethers.utils.formatUnits(amountOut4[amountOut4.length - 1], decimals)
    // );
  } catch (error) {
    // console.log("ape   amountOut4: N/A");
  }

  // console.log(`FirstDex: ${firstDex} --> (SecondDex: ${secondDex} || ThirdDex: ${thirdDex})`);

  return { firstDex, secondDex, thirdDex };
}

async function getExpectedOutput(firstDex, secondDex, config, params, type) {
  const amount = config.amount;
  const token0 = config.token0;
  const token1 = config.token1;
  const exchanges = await getExchanges(type);

  let amountOut1, amountOut2, amountInDex, amountTemp, finalAmount;
  let profitable = false;

  try {
    if (firstDex == "uni" && (secondDex == "sushi" || secondDex == "quick" || secondDex == "ape")) {
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
      if (amountOut2[1].gt(amount)) {
        profitable = true;
      }
    }

    if (
      (firstDex == "quick" || firstDex == "sushi" || firstDex == "ape") &&
      (secondDex == "quick" || secondDex == "sushi" || secondDex == "ape")
    ) {
      amountOut1 = await exchanges[firstDex].getAmountsOut(amount, [token0, token1]);
      amountOut2 = await exchanges[secondDex].getAmountsOut(amountOut1[1], [token1, token0]);

      amountInDex = ethers.utils.formatUnits(amountOut1[0], 18);
      amountTemp = ethers.utils.formatUnits(amountOut2[0], 18);
      finalAmount = ethers.utils.formatUnits(amountOut2[1], 18);
      if (amountOut2[1].gt(amount)) {
        profitable = true;
      }
    }

    if ((firstDex == "quick" || firstDex == "sushi" || firstDex == "ape") && secondDex == "uni") {
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
      if (amountOut2.gt(amount)) {
        profitable = true;
      }
    }

    console.log(
      `profitable: ${profitable} (${parseFloat(amountInDex).toFixed(
        8
      )} --${firstDex}--> ${parseFloat(amountTemp).toFixed(8)} --${secondDex}--> ${parseFloat(
        finalAmount
      ).toFixed(8)})`
    );
    return profitable;
  } catch (error) {
    console.log("Error consiguiendo la ruta de swaps", error);
    return profitable;
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

async function getExchanges(type) {
  const sushi = new ethers.Contract(
    dexes.polygon.sushi.address,
    dexes.polygon.sushi.abi,
    deployer[type]
  );

  const quick = new ethers.Contract(
    dexes.polygon.quick.address,
    dexes.polygon.quick.abi,
    deployer[type]
  );

  const merkat = new ethers.Contract(
    dexes.polygon.merkat.address,
    dexes.polygon.merkat.abi,
    deployer[type]
  );

  const ape = new ethers.Contract(dexes.polygon.ape.address, dexes.polygon.ape.abi, deployer[type]);

  const uni = new ethers.Contract(dexes.polygon.uni.address, dexes.polygon.uni.abi, deployer[type]);

  const uniQuoter = new ethers.Contract(
    dexes.polygon.uniQuoter.address,
    dexes.polygon.uniQuoter.abi,
    deployer[type]
  );

  return { sushi, quick, uni, uniQuoter, ape, merkat };
}

module.exports = {
  getDiff,
  getExpectedOutput,
  getTokenBalance,
  getTokenData,
  getExchanges,
};
