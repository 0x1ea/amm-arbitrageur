// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9;

interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint deadline;
        uint amountIn;
        uint amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
    struct ExactInputParams {
        bytes path;
        address recipient;
        uint deadline;
        uint amountIn;
        uint amountOutMinimum;
    }
    struct ExactOutputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint deadline;
        uint amountOut;
        uint amountInMaximum;
        uint160 sqrtPriceLimitX96;
    }
    struct ExactOutputParams {
        bytes path;
        address recipient;
        uint deadline;
        uint amountOut;
        uint amountInMaximum;
    }

    function exactInputSingle(ExactInputSingleParams memory params)
        external
        returns (uint amountOut);

    function exactInput(ExactInputParams memory params)
        external
        returns (uint amountOut);

    function exactOutputSingle(ExactOutputSingleParams memory params)
        external
        returns (uint amountIn);

    function exactOutput(ExactOutputParams memory params)
        external
        returns (uint amountIn);
}
