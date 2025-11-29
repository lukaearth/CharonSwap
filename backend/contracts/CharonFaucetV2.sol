// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Charon Faucet
/// @notice Simple faucet for CHR + FETH on Sepolia with per-wallet cooldown
contract CharonFaucet is Ownable, ReentrancyGuard {
    IERC20 public immutable chrToken;
    IERC20 public immutable fethToken;

    // drip amounts (18 decimals)
    uint256 public chrAmount = 1_000 * 1e18;    // 1000 CHR
    uint256 public fethAmount = 5e17;           // 0.5 FETH

    // cooldown between drips per wallet (in seconds)
    uint256 public cooldown = 12 hours;

    // last claim timestamps
    mapping(address => uint256) public lastChrDrip;
    mapping(address => uint256) public lastFethDrip;

    bool public paused;

    event DripCHR(address indexed user, uint256 amount);
    event DripFETH(address indexed user, uint256 amount);
    event DripBoth(address indexed user, uint256 chrAmount, uint256 fethAmount);
    event Paused(bool paused);
    event CooldownUpdated(uint256 cooldown);
    event AmountsUpdated(uint256 chrAmount, uint256 fethAmount);

    constructor(address _chr, address _feth) Ownable(msg.sender) {
        require(_chr != address(0) && _feth != address(0), "Invalid token");
        chrToken = IERC20(_chr);
        fethToken = IERC20(_feth);
    }

    // ---------- Modifiers ----------

    modifier notPaused() {
        require(!paused, "Faucet paused");
        _;
    }

    modifier checkChrCooldown(address user) {
        require(
            block.timestamp >= lastChrDrip[user] + cooldown,
            "CHR: cooldown not passed"
        );
        _;
    }

    modifier checkFethCooldown(address user) {
        require(
            block.timestamp >= lastFethDrip[user] + cooldown,
            "FETH: cooldown not passed"
        );
        _;
    }

    // ---------- View helpers ----------

    function nextChrAvailable(address user) external view returns (uint256) {
        uint256 nextTime = lastChrDrip[user] + cooldown;
        if (block.timestamp >= nextTime) return 0;
        return nextTime - block.timestamp;
    }

    function nextFethAvailable(address user) external view returns (uint256) {
        uint256 nextTime = lastFethDrip[user] + cooldown;
        if (block.timestamp >= nextTime) return 0;
        return nextTime - block.timestamp;
    }

    // ---------- Drip functions ----------

    /// @notice Get CHR from faucet (1000 CHR default)
    function dripCHR()
        external
        nonReentrant
        notPaused
        checkChrCooldown(msg.sender)
    {
        require(chrAmount > 0, "CHR amount = 0");
        require(
            chrToken.balanceOf(address(this)) >= chrAmount,
            "Faucet out of CHR"
        );

        lastChrDrip[msg.sender] = block.timestamp;
        require(
            chrToken.transfer(msg.sender, chrAmount),
            "CHR transfer failed"
        );

        emit DripCHR(msg.sender, chrAmount);
    }

    /// @notice Get FETH from faucet (0.5 FETH default)
    function dripFETH()
        external
        nonReentrant
        notPaused
        checkFethCooldown(msg.sender)
    {
        require(fethAmount > 0, "FETH amount = 0");
        require(
            fethToken.balanceOf(address(this)) >= fethAmount,
            "Faucet out of FETH"
        );

        lastFethDrip[msg.sender] = block.timestamp;
        require(
            fethToken.transfer(msg.sender, fethAmount),
            "FETH transfer failed"
        );

        emit DripFETH(msg.sender, fethAmount);
    }

    /// @notice Convenience: drip both tokens in one tx
    function dripBoth()
        external
        nonReentrant
        notPaused
        checkChrCooldown(msg.sender)
        checkFethCooldown(msg.sender)
    {
        require(chrAmount > 0 || fethAmount > 0, "Amounts = 0");

        if (chrAmount > 0) {
            require(
                chrToken.balanceOf(address(this)) >= chrAmount,
                "Faucet out of CHR"
            );
        }
        if (fethAmount > 0) {
            require(
                fethToken.balanceOf(address(this)) >= fethAmount,
                "Faucet out of FETH"
            );
        }

        lastChrDrip[msg.sender] = block.timestamp;
        lastFethDrip[msg.sender] = block.timestamp;

        if (chrAmount > 0) {
            require(
                chrToken.transfer(msg.sender, chrAmount),
                "CHR transfer failed"
            );
        }
        if (fethAmount > 0) {
            require(
                fethToken.transfer(msg.sender, fethAmount),
                "FETH transfer failed"
            );
        }

        emit DripBoth(msg.sender, chrAmount, fethAmount);
    }

    // ---------- Admin controls ----------

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }

    function setCooldown(uint256 _cooldown) external onlyOwner {
        require(_cooldown >= 1 minutes, "Cooldown too low");
        cooldown = _cooldown;
        emit CooldownUpdated(_cooldown);
    }

    function setAmounts(uint256 _chrAmount, uint256 _fethAmount)
        external
        onlyOwner
    {
        chrAmount = _chrAmount;
        fethAmount = _fethAmount;
        emit AmountsUpdated(_chrAmount, _fethAmount);
    }

    /// @notice Rescue *any* ERC20 from faucet (including CHR/FETH if needed)
    function rescueTokens(
        address token,
        uint256 amount,
        address to
    ) external onlyOwner {
        require(to != address(0), "Invalid to");
        IERC20(token).transfer(to, amount);
    }
}
