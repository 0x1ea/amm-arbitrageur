const { deployer, ethers } = require("../config/blockchain");

async function gas() {
  let gasPrice = await deployer.getFeeData();
  let gasPrice2 = gasPrice.gasPrice.mul(120);
  gasPrice2 = gasPrice2.div(100);

  console.log("gasPrice: ", ethers.utils.formatUnits(gasPrice.gasPrice, 9));
  console.log("gasPrice2:", ethers.utils.formatUnits(gasPrice2, 9));
  console.log("maxFeePerGas:", ethers.utils.formatUnits(gasPrice.maxFeePerGas, 9));
  console.log(
    "maxPriorityFeePerGas:",
    ethers.utils.formatUnits(gasPrice.maxPriorityFeePerGas, 9)
  );
}

gas();
