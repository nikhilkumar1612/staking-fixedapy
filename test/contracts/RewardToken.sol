// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RewardToken is ERC20 {
    constructor() ERC20("Reward Token", "RTOK"){}

    function mint(address _account, uint256 _amount) external {
        _mint(_account, _amount);
    }
}