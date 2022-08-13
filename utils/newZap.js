const { deployer, ethers, provider } = require("../config/blockchain");
const dexes = require("../config/dexes.json");

let swampert;

async function newZap(firstDex, secondDex, amount, path, TYPE) {
  const myProvider = provider[TYPE];
  swampert = new ethers.Contract(
    dexes.polygon.zap2.address,
    dexes.polygon.zap2.abi,
    deployer[TYPE]
  );
  const length = path.length - 1;
  let inversePath = [];

  for (let i = length; i >= 0; i--) {
    inversePath.push(path[i]);
  }
  const firstDexAddress = dexes.polygon[firstDex].address;
  const secondDexAddress = dexes.polygon[secondDex].address;

  try {
    let gasPrice = await myProvider.getGasPrice();
    gasPrice = gasPrice.mul(105);
    gasPrice = gasPrice.div(100);

    if (firstDex == "uni") {
      const profitable = await estimateSwapV3toV2(
        amount,
        firstDexAddress,
        secondDexAddress,
        inversePath,
        length,
        gasPrice
      );
      if (profitable) {
        let balance = await deployer[TYPE].getBalance();
        console.log("balance:", balance.toString());
        await swapV3toV2(amount, firstDexAddress, secondDexAddress, inversePath, length);
        balance = await deployer[TYPE].getBalance();
        console.log("balance:", balance.toString());
      }
    } else if (firstDex != "uni" && secondDex != "uni") {
      const profitable = await estimateSwapV2toV2(
        amount,
        firstDexAddress,
        secondDexAddress,
        path,
        inversePath,
        length,
        gasPrice
      );
      if (profitable) {
        let balance = await deployer[TYPE].getBalance();
        console.log("balance:", balance.toString());
        await swapV2toV2(amount, firstDexAddress, secondDexAddress, path, inversePath, length);
        balance = await deployer[TYPE].getBalance();
        console.log("balance:", balance.toString());
      }
    } else {
      const profitable = await estimateSwapV2toV3(
        amount,
        firstDexAddress,
        secondDexAddress,
        path,
        length,
        gasPrice
      );
      if (profitable) {
        let balance = await deployer[TYPE].getBalance();
        console.log("balance:", balance.toString());
        await swapV2toV3(amount, firstDexAddress, secondDexAddress, path, length);
        balance = await deployer[TYPE].getBalance();
        console.log("balance:", balance.toString());
      }
    }
  } catch (error) {
    console.log("something went wrong:", error.reason);
  }
}

async function estimateSwapV3toV2(inputAmount, firstDex, secondDex, inversePath, length, gasPrice) {
  let txGasCost;
  try {
    txGasCost = await swampert.estimateGas.fromV3ToV2(firstDex, secondDex, inversePath, length, {
      value: inputAmount,
    });

    const outputAmount = await swampert.callStatic.fromV3ToV2(
      firstDex,
      secondDex,
      inversePath,
      length,
      {
        value: inputAmount,
      }
    );
    const transactionCost = txGasCost.mul(gasPrice);

    const result = outputAmount.sub(transactionCost);
    const profitable = result.gt(inputAmount);

    const formattedTxCost = parseFloat(ethers.utils.formatEther(transactionCost)).toFixed(5);
    const formattedInput = parseFloat(ethers.utils.formatEther(inputAmount)).toFixed(5);
    const formattedOutput = parseFloat(ethers.utils.formatEther(outputAmount)).toFixed(5);

    console.log(
      `Profitable: ${profitable} | txCost: ${formattedTxCost} | ${formattedInput} ---> ${formattedOutput}`
    );

    return profitable;
  } catch (error) {
    return false;
  }
}

async function estimateSwapV2toV2(
  inputAmount,
  firstDex,
  secondDex,
  path,
  inversePath,
  length,
  gasPrice
) {
  try {
    const txGasCost = await swampert.estimateGas.fromV2ToV2(
      firstDex,
      secondDex,
      path,
      inversePath,
      length,
      {
        value: inputAmount,
      }
    );

    const outputAmount = await swampert.callStatic.fromV2ToV2(
      firstDex,
      secondDex,
      path,
      inversePath,
      length,
      {
        value: inputAmount,
      }
    );
    const transactionCost = txGasCost.mul(gasPrice);
    const result = outputAmount.sub(transactionCost);
    const profitable = result.gt(inputAmount);

    const formattedTxCost = parseFloat(ethers.utils.formatEther(transactionCost)).toFixed(5);
    const formattedInput = parseFloat(ethers.utils.formatEther(inputAmount)).toFixed(5);
    const formattedOutput = parseFloat(ethers.utils.formatEther(outputAmount)).toFixed(5);

    console.log(
      `Profitable: ${profitable} | txCost: ${formattedTxCost} | ${formattedInput} ---> ${formattedOutput}`
    );

    return profitable;
  } catch (error) {
    return false;
  }
}

async function estimateSwapV2toV3(inputAmount, firstDex, secondDex, path, length, gasPrice) {
  try {
    const txGasCost = await swampert.estimateGas.fromV2ToV3(firstDex, secondDex, path, length, {
      value: inputAmount,
    });

    const outputAmount = await swampert.fromV2ToV3(firstDex, secondDex, path, length, {
      value: inputAmount,
    });
    const transactionCost = txGasCost.mul(gasPrice);

    const result = outputAmount.sub(transactionCost);
    const profitable = result.gt(inputAmount);

    const formattedTxCost = parseFloat(ethers.utils.formatEther(transactionCost)).toFixed(5);
    const formattedInput = parseFloat(ethers.utils.formatEther(inputAmount)).toFixed(5);
    const formattedOutput = parseFloat(ethers.utils.formatEther(outputAmount)).toFixed(5);

    console.log(
      `Profitable: ${profitable} | txCost: ${formattedTxCost} | ${formattedInput} ---> ${formattedOutput}`
    );

    return profitable;
  } catch (error) {
    return false;
  }
}

async function swapV3toV2(inputAmount, firstDex, secondDex, inversePath, length) {
  await swampert.fromV3ToV2(firstDex, secondDex, inversePath, length, {
    value: inputAmount,
    gasPrice: gasPrice,
  });
}

async function swapV2toV2(inputAmount, firstDex, secondDex, path, inversePath, length) {
  await swampert.fromV2ToV2(firstDex, secondDex, path, inversePath, length, {
    value: inputAmount,
    gasPrice: gasPrice,
  });
}

async function swapV2toV3(inputAmount, firstDex, secondDex, path, length) {
  await swampert.fromV2ToV3(firstDex, secondDex, path, length, {
    value: inputAmount,
    gasPrice: gasPrice,
  });
}

module.exports = { newZap };
