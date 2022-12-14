//SPDX-License-Identifier: MIT
pragma solidity >=0.8.9;

import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/ISwapRouter.sol";
import "./interfaces/IWeth.sol";

contract Zap2 {
    address public WETH;
    address public owner;
    uint public amountOut;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor(address _weth) {
        WETH = _weth;
        owner = msg.sender;
    }

    function fromV2ToV2(
        IUniswapV2Router02 firstDex,
        IUniswapV2Router02 secondDex,
        address[] calldata path,
        address[] calldata inversePath,
        uint length
    ) public payable onlyOwner returns (uint) {
        firstDex.swapExactETHForTokens{value: msg.value}(0, path, address(this), block.timestamp);

        IWeth token = IWeth(path[length]);
        amountOut = token.balanceOf(address(this));
        token.approve(address(secondDex), amountOut);

        uint[] memory outputAmount = secondDex.swapExactTokensForETH(
            amountOut,
            0,
            inversePath,
            msg.sender,
            block.timestamp
        );

        require(outputAmount[length] > msg.value, "0");
        return outputAmount[length];
    }

    function fromV3ToV2(
        ISwapRouter firstDex,
        IUniswapV2Router02 secondDex,
        address[] calldata inversePath,
        uint length
    ) public payable onlyOwner returns (uint) {
        IWeth token = IWeth(WETH);
        token.deposit{value: msg.value}();
        token.approve(address(firstDex), msg.value);

        amountOut = firstDex.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: WETH,
                tokenOut: inversePath[0],
                fee: 3000,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: msg.value,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );

        IWeth token2 = IWeth(inversePath[0]);
        token2.approve(address(secondDex), amountOut);

        uint[] memory outputAmount = secondDex.swapExactTokensForETH(
            amountOut,
            0,
            inversePath,
            msg.sender,
            block.timestamp
        );

        require(outputAmount[length] > msg.value, "0");
        return outputAmount[length];
    }

    function fromV2ToV3(
        IUniswapV2Router02 firstDex,
        ISwapRouter secondDex,
        address[] memory path,
        uint length
    ) public payable onlyOwner returns (uint) {
        firstDex.swapExactETHForTokens{value: msg.value}(0, path, address(this), block.timestamp);

        IWeth token = IWeth(path[length]);
        amountOut = token.balanceOf(address(this));
        token.approve(address(secondDex), amountOut);

        uint outputAmount = secondDex.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: path[length],
                tokenOut: WETH,
                fee: 3000,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountOut,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );

        require(outputAmount > msg.value, "0");
        return outputAmount;
    }
}
