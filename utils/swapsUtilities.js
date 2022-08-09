const { deployer, ethers } = require("../config/blockchain");
const dexes = require("../config/dexes.json");
const aave = require("../config/aave.json");

const WRAPPER_ABI = aave.polygon.iWeth.abi;

async function getDiff(config) {
  const amount = config.amount;
  const token0 = config.token0;
  const token1 = config.token1;
  const exchanges = config.exchanges;

  let inExchange = "sushi";
  let outExchange = "quick";
  let amountOut;
  let amountOut2;
  let diff, price_1, price_2;

  try {
    amountOut = await exchanges[inExchange].getAmountOut(amount, token0, token1);
    amountOut2 = await exchanges[outExchange].getAmountOut(amount, token0, token1);

    const { decimals } = await getTokenData(token1, deployer);
    console.log(decimals.toString());
    console.log(`${inExchange} in:`);
    // console.log("amountOut[0]", ethers.utils.formatUnits(amountOut, 18));
    console.log("amountOut", ethers.utils.formatUnits(amountOut, decimals));
    console.log(`\n${outExchange} out:`);
    // console.log("amountOut[0]", ethers.utils.formatUnits(amountOut2[0], 18));
    console.log("amountOut2", ethers.utils.formatUnits(amountOut2, decimals));
    console.log("------------------------------------------------------------------");

    if (amountOut.gt(amountOut2)) {
      price_1 = amountOut;
      price_2 = amountOut2;
    } else {
      price_1 = amountOut2;
      price_2 = amountOut;
    }

    let res = price_1.sub(price_2);
    res = Number.parseFloat(ethers.utils.formatUnits(res, decimals)).toFixed(8);
    formatted_price_2 = Number.parseFloat(
      ethers.utils.formatUnits(price_2, decimals)
    ).toFixed(8);
    diff = Number.parseFloat(res / formatted_price_2).toFixed(8);

    console.log(
      `\nPercentage difference between ${inExchange} and ${outExchange}: ${diff}`
    );
  } catch (error) {
    console.log("No existe alguno de esos pares");
  }

  return { diff, price_1, price_2 };
}

async function getExpectedOutput(firstDex, secondDex, config, params) {
  const amount = config.amount;
  const token0 = config.token0;
  const token1 = config.token1;
  const exchanges = config.exchanges;

  let amountOut1, amountOut2, amountInDex, amountTemp, finalAmount;

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

  console.log(`
${parseFloat(amountInDex).toFixed(8)} --${firstDex}--> ${parseFloat(amountTemp).toFixed(
    8
  )} --${secondDex}--> ${parseFloat(finalAmount).toFixed(8)}`);
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
