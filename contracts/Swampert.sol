//SPDX-License-Identifier: MIT
pragma solidity >=0.8.9;

import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/ISwapRouter.sol";
import "./interfaces/IWeth.sol";

contract Swampert {
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
        address[] calldata inversePath
    ) public payable onlyOwner {
        firstDex.swapExactETHForTokens{value: msg.value}(
            0,
            path,
            address(this),
            block.timestamp
        );

        IWeth token = IWeth(path[1]);
        amountOut = token.balanceOf(address(this));
        token.approve(address(secondDex), amountOut);

        secondDex.swapExactTokensForETH(
            amountOut,
            0,
            inversePath,
            msg.sender,
            block.timestamp
        );
    }

    function fromV3ToV2(
        ISwapRouter firstDex,
        IUniswapV2Router02 secondDex,
        address[] calldata inversePath
    ) public payable onlyOwner {
        IWeth token = IWeth(inversePath[1]);
        token.deposit{value: msg.value}();
        token.approve(address(firstDex), msg.value);

        amountOut = firstDex.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: inversePath[1],
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

        secondDex.swapExactTokensForETH(
            amountOut,
            0,
            inversePath,
            msg.sender,
            block.timestamp
        );
    }

    function fromV2ToV3(
        IUniswapV2Router02 firstDex,
        ISwapRouter secondDex,
        address[] memory path
    ) public payable onlyOwner {
        firstDex.swapExactETHForTokens{value: msg.value}(
            0,
            path,
            address(this),
            block.timestamp
        );

        IWeth token = IWeth(path[1]);
        amountOut = token.balanceOf(address(this));
        token.approve(address(secondDex), amountOut);

        secondDex.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: path[1],
                tokenOut: path[0],
                fee: 3000,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountOut,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );
    }
}
