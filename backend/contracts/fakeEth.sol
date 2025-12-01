// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FakeETH is ERC20 {
    address public owner;

    constructor() ERC20("Fake ETH", "FETH") {
        owner = msg.sender;
        // Seed deployer so local testing works immediately
        _mint(msg.sender, 1000 ether);
    }

    // Owner can top up balances for testing or faucet use
    function mint(address to, uint256 amount) external {
        require(msg.sender == owner, "Not owner");
        _mint(to, amount);
    }
}
