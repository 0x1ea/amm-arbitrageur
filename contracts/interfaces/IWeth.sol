// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9;

interface IWeth {
    function allowance(address owner, address spender)
        external
        view
        returns (uint remaining);

    function approve(address spender, uint value)
        external
        returns (bool success);

    function balanceOf(address owner) external view returns (uint balance);

    function decimals() external view returns (uint8 decimalPlaces);

    function name() external view returns (string memory tokenName);

    function symbol() external view returns (string memory tokenSymbol);

    function totalSupply() external view returns (uint totalTokensIssued);

    function transfer(address to, uint value) external returns (bool success);

    function transferFrom(
        address from,
        address to,
        uint value
    ) external returns (bool success);

    function deposit() external payable;

    function withdraw(uint wad) external;
}
