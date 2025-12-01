// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FakeETH is ERC20 {
    address public owner;

    constructor() ERC20("Fake ETH", "FETH") {
        owner = msg.sender;
        _mint(msg.sender, 1000 ether); // Seed deployer for local testing
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == owner, "Not owner");
        _mint(to, amount);
    }
}
