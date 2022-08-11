const { deployer, ethers, provider } = require("../config/blockchain");

async function gas() {
  let gasPrice = await deployer.private.getFeeData();
  let gasPrice2 = gasPrice.gasPrice.mul(120);
  gasPrice2 = gasPrice2.div(100);

  let gas = await deployer.private.getGasPrice();

  gas = gas.mul(110);
  gas = gas.div(100);
  console.log("gas:", ethers.utils.formatUnits(gas, 9));
  console.log("gasPrice: ", ethers.utils.formatUnits(gasPrice.gasPrice, 9));
  console.log("gasPrice2:", ethers.utils.formatUnits(gasPrice2, 9));
  console.log("maxFeePerGas:", ethers.utils.formatUnits(gasPrice.maxFeePerGas, 9));
  console.log(
    "maxPriorityFeePerGas:",
    ethers.utils.formatUnits(gasPrice.maxPriorityFeePerGas, 9)
  );
}

gas();
