const { deployer, ethers, provider, BN } = require("../config/blockchain");
const dexes = require("../config/dexes.json");
const aave = require("../config/aave.json");
let swampert;

async function estimateOutput() {
  const myProvider = provider["local"];

  const USDT = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";
  const USDC = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
  const TOKEN = "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a";
  const TYPE = "local";
  const ONE = BN.from("1000000000000000000");
  const WMATIC_ADDRESS = aave.polygon.iWeth.address;
  swampert = new ethers.Contract(
    "0x27081040aef2218553ce33bA1d4BC148c1b41fa3", // dexes.polygon.swampert.address,
    [
      {
        inputs: [
          {
            internalType: "address",
            name: "_weth",
            type: "address",
          },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [],
        name: "WETH",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "amountOut",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "contract IUniswapV2Router02",
            name: "firstDex",
            type: "address",
          },
          {
            internalType: "contract IUniswapV2Router02",
            name: "secondDex",
            type: "address",
          },
          {
            internalType: "address[]",
            name: "path",
            type: "address[]",
          },
          {
            internalType: "address[]",
            name: "inversePath",
            type: "address[]",
          },
          {
            internalType: "uint256",
            name: "length",
            type: "uint256",
          },
        ],
        name: "fromV2ToV2",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "contract IUniswapV2Router02",
            name: "firstDex",
            type: "address",
          },
          {
            internalType: "contract ISwapRouter",
            name: "secondDex",
            type: "address",
          },
          {
            internalType: "address[]",
            name: "path",
            type: "address[]",
          },
          {
            internalType: "uint256",
            name: "length",
            type: "uint256",
          },
        ],
        name: "fromV2ToV3",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "contract ISwapRouter",
            name: "firstDex",
            type: "address",
          },
          {
            internalType: "contract IUniswapV2Router02",
            name: "secondDex",
            type: "address",
          },
          {
            internalType: "address[]",
            name: "inversePath",
            type: "address[]",
          },
          {
            internalType: "uint256",
            name: "length",
            type: "uint256",
          },
        ],
        name: "fromV3ToV2",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [],
        name: "owner",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    deployer[TYPE]
  );
  const firstDex = "sushi";
  const secondDex = "quick";
  const amount = ONE.mul(13);
  const path = [WMATIC_ADDRESS, USDT, TOKEN];
  console.log(path);
  const length = path.length - 1;
  let inversePath = [];

  for (let i = length; i >= 0; i--) {
    inversePath.push(path[i]);
  }
  console.log(inversePath);

  console.log("index:", length);
  const firstDexAddress = dexes.polygon[firstDex].address;
  const secondDexAddress = dexes.polygon[secondDex].address;

  try {
    let response;
    let gasPrice = await myProvider.getGasPrice();
    gasPrice = gasPrice.mul(105);
    gasPrice = gasPrice.div(100);

    if (firstDex == "uni") {
      response = await estimateSwapV3toV2(
        amount,
        firstDexAddress,
        secondDexAddress,
        inversePath,
        length
      );
    } else if (firstDex != "uni" && secondDex != "uni") {
      response = await estimateSwapV2toV2(
        amount,
        firstDexAddress,
        secondDexAddress,
        path,
        inversePath,
        length
      );
    } else {
      response = await estimateSwapV2toV3(amount, firstDexAddress, secondDexAddress, path, length);
    }

    const transactionCost = response.txGasCost.mul(gasPrice);
    const formattedTxCost = parseFloat(ethers.utils.formatEther(transactionCost)).toFixed(5);

    const result = response.outputAmount.sub(transactionCost);
    const profitable = result.gt(amount);

    const formattedInput = parseFloat(ethers.utils.formatEther(amount)).toFixed(5);
    const formattedOutput = parseFloat(ethers.utils.formatEther(response.outputAmount)).toFixed(5);

    console.log(
      `Profitable: ${profitable} | txCost: ${formattedTxCost} | ${formattedInput} --(${firstDex}/${secondDex})--> ${formattedOutput}`
    );
    return profitable;
  } catch (error) {
    console.log("something went wrong:", error.reason);
    return false;
  }
}

async function estimateSwapV3toV2(inputAmount, firstDex, secondDex, inversePath, length) {
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

    return { outputAmount, txGasCost };
  } catch (error) {
    console.log(error.reason);
    return { outputAmount: BN.from("0"), txGasCost: BN.from("0") };
  }
}

async function estimateSwapV2toV2(inputAmount, firstDex, secondDex, path, inversePath, length) {
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

    return { outputAmount, txGasCost };
  } catch (error) {
    console.log(error.reason);
    return { outputAmount: BN.from("0"), txGasCost: BN.from("0") };
  }
}

async function estimateSwapV2toV3(inputAmount, firstDex, secondDex, path, length) {
  try {
    const txGasCost = await swampert.estimateGas.fromV2ToV3(firstDex, secondDex, path, length, {
      value: inputAmount,
    });

    const outputAmount = await swampert.fromV2ToV3(firstDex, secondDex, path, length, {
      value: inputAmount,
    });

    return { outputAmount, txGasCost };
  } catch (error) {
    console.log(error.reason);
    return { outputAmount: BN.from("0"), txGasCost: BN.from("0") };
  }
}

estimateOutput();
module.exports = { estimateOutput };
