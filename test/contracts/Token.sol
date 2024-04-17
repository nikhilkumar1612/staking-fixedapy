// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor() ERC20("TOKEN", "TOK"){}

    function mint(address _account, uint256 _amount) external {
        _mint(_account, _amount);
    }
}