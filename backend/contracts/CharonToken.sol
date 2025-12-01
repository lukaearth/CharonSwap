// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract Charon is ERC20, ERC20Permit {
    address public owner;

    constructor() ERC20("Charon", "CHR") ERC20Permit("CHARON") {
        owner = msg.sender;
        // Start with a supply owned by the deployer
        _mint(msg.sender, 1_000_000 * 1e18);
    }

    // Owner can mint extra tokens for rewards or testing
    function mint(address to, uint256 amount) external {
        require(msg.sender == owner, "Not owner");
        _mint(to, amount);
    }
}
