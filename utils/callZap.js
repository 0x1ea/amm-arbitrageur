const { deployer, ethers, provider } = require("../config/blockchain");
const metadata = require("../artifacts/contracts/Swampert.sol/Swampert.json");
const dexes = require("../config/dexes.json");

let swampert;

async function callZap(firstDex, secondDex, amount, TOKEN0, TOKEN1, TYPE) {
  const myDeployer = deployer[TYPE];
  const myProvider = provider[TYPE];
  swampert = new ethers.Contract(
    "0x93357fb24dff071936d6ba7Af3DC73A321Ec420c",
    metadata.abi,
    deployer[TYPE]
  );
  const path = [TOKEN0, TOKEN1];
  const inversePath = [TOKEN1, TOKEN0];
  const firstDexAddress = dexes.polygon[firstDex].address;
  const secondDexAddress = dexes.polygon[secondDex].address;

  try {
    let balance = await myDeployer.getBalance();
    console.log("balance:", balance.toString());

    if (firstDex == "uni") {
      const profitable = await estimateSwapV3toV2(
        amount,
        firstDexAddress,
        secondDexAddress,
        inversePath,
        myProvider
      );
      if (profitable) {
        await swapV3toV2(amount, firstDexAddress, secondDexAddress, inversePath);
      }
    } else if (firstDex != "uni" && secondDex != "uni") {
      const profitable = await estimateSwapV2toV2(
        amount,
        firstDexAddress,
        secondDexAddress,
        path,
        inversePath,
        myProvider
      );
      if (profitable) {
        await swapV2toV2(amount, firstDexAddress, secondDexAddress, path, inversePath);
      }
    } else {
      const profitable = await estimateSwapV2toV3(
        amount,
        firstDexAddress,
        secondDexAddress,
        path,
        myProvider
      );
      if (profitable) {
        await swapV2toV3(amount, firstDexAddress, secondDexAddress, path);
      }
    }
    balance = await myDeployer.getBalance();
    console.log("balance:", balance.toString());
  } catch (error) {
    console.log(error);
  }
}

async function swapV3toV2(inputAmount, firstDex, secondDex, inversePath) {
  await swampert.fromV3ToV2(firstDex, secondDex, inversePath, {
    value: inputAmount,
  });
  const amountOut = await swampert.amountOut();
  console.log("amountOut:", amountOut.toString());
}

async function estimateSwapV3toV2(
  inputAmount,
  firstDex,
  secondDex,
  inversePath,
  myProvider
) {
  try {
    let gasPrice = await myProvider.getGasPrice();
    gasPrice = gasPrice.mul(105);
    gasPrice = gasPrice.div(100);

    const txGasCost = await swampert.estimateGas.fromV3ToV2(
      firstDex,
      secondDex,
      inversePath,
      {
        value: inputAmount,
      }
    );

    const transactionCost = txGasCost.mul(gasPrice);

    const outputAmount = await swampert.callStatic.fromV3ToV2(
      firstDex,
      secondDex,
      inversePath,
      {
        value: inputAmount,
      }
    );

    const result = outputAmount.sub(transactionCost);

    console.log("gasPrice:", gasPrice.toString());
    console.log("outputAmount:", outputAmount.toString());
    console.log("transactionCost:", transactionCost.toString());
    console.log("result:", result.toString());
    if (result.gt(inputAmount)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("something went wrong:", error.reason);
    return false;
  }
}

async function swapV2toV2(inputAmount, firstDex, secondDex, path, inversePath) {
  await swampert.fromV2ToV2(firstDex, secondDex, path, inversePath, {
    value: inputAmount,
  });
  const amountOut = await swampert.amountOut();
  console.log("amountOut:", amountOut.toString());
}

async function estimateSwapV2toV2(
  inputAmount,
  firstDex,
  secondDex,
  path,
  inversePath,
  myProvider
) {
  try {
    let gasPrice = await myProvider.getGasPrice();
    gasPrice = gasPrice.mul(105);
    gasPrice = gasPrice.div(100);

    const txGasCost = await swampert.estimateGas.fromV2ToV2(
      firstDex,
      secondDex,
      path,
      inversePath,
      {
        value: inputAmount,
      }
    );

    const transactionCost = txGasCost.mul(gasPrice);

    const outputAmount = await swampert.callStatic.fromV2ToV2(
      firstDex,
      secondDex,
      path,
      inversePath,
      {
        value: inputAmount,
      }
    );

    const result = outputAmount.sub(transactionCost);

    console.log("gasPrice:", gasPrice.toString());
    console.log("outputAmount:", outputAmount.toString());
    console.log("transactionCost:", transactionCost.toString());
    console.log("result:", result.toString());
    if (result.gt(inputAmount)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("something went wrong:", error.reason);
    return false;
  }
}

async function swapV2toV3(inputAmount, firstDex, secondDex, path) {
  await swampert.fromV2ToV3(firstDex, secondDex, path, {
    value: inputAmount,
  });
  const amountOut = await swampert.amountOut();
  console.log("amountOut:", amountOut.toString());
}

async function estimateSwapV2toV3(inputAmount, firstDex, secondDex, path, myProvider) {
  try {
    let gasPrice = await myProvider.getGasPrice();
    gasPrice = gasPrice.mul(105);
    gasPrice = gasPrice.div(100);

    const txGasCost = await swampert.estimateGas.fromV2ToV3(firstDex, secondDex, path, {
      value: inputAmount,
    });

    const transactionCost = txGasCost.mul(gasPrice);

    const outputAmount = await swampert.fromV2ToV3(firstDex, secondDex, path, {
      value: inputAmount,
    });

    const result = outputAmount.sub(transactionCost);
    console.log("gasPrice:", gasPrice.toString());
    console.log("outputAmount:", outputAmount.toString());
    console.log("transactionCost:", transactionCost.toString());
    console.log("result:", result.toString());
    if (result.gt(inputAmount)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("something went wrong:", error.reason);
    return false;
  }
}

module.exports = { callZap };
