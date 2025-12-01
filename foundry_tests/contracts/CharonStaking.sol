// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Charon single-sided staking
/// @notice Stake CHR, earn CHR. Owner can pause and adjust reward rate.
contract CharonStaking is Ownable, ReentrancyGuard {
    IERC20 public immutable stakingToken; // CHR
    IERC20 public immutable rewardToken;  // CHR (mirrors staking token in v1)

    // Tokens distributed per second (18 decimals)
    uint256 public rewardRate;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    bool public paused;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    uint256 public totalSupply;
    mapping(address => uint256) public balances;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    event Paused(bool paused);

        constructor(address _stakingToken) 
            Ownable(msg.sender) 
        {
            require(_stakingToken != address(0), "Invalid token");
            stakingToken = IERC20(_stakingToken);
            rewardToken = IERC20(_stakingToken);

            lastUpdateTime = block.timestamp;
        }


    modifier notPaused() {
        require(!paused, "Staking is paused");
        _;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /// @notice reward per staked token, scaled by 1e18
    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }
        uint256 elapsed = block.timestamp - lastUpdateTime;
        return rewardPerTokenStored + ((elapsed * rewardRate * 1e18) / totalSupply);
    }

    /// @notice pending rewards for a user
    function earned(address account) public view returns (uint256) {
        return
            (balances[account] *
                (rewardPerToken() - userRewardPerTokenPaid[account])) /
            1e18 +
            rewards[account];
    }

    /// @notice Stake CHR
    function stake(uint256 amount)
        external
        nonReentrant
        notPaused
        updateReward(msg.sender)
    {
        require(amount > 0, "Cannot stake 0");
        totalSupply += amount;
        balances[msg.sender] += amount;

        require(
            stakingToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        emit Staked(msg.sender, amount);
    }

    /// @notice Withdraw staked CHR (without claiming rewards)
    function withdraw(uint256 amount)
        public
        nonReentrant
        updateReward(msg.sender)
    {
        require(amount > 0, "Cannot withdraw 0");
        require(balances[msg.sender] >= amount, "Insufficient staked");

        totalSupply -= amount;
        balances[msg.sender] -= amount;

        require(
            stakingToken.transfer(msg.sender, amount),
            "Transfer failed"
        );

        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Claim pending rewards
    function getReward() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            require(
                rewardToken.transfer(msg.sender, reward),
                "Reward transfer failed"
            );
            emit RewardPaid(msg.sender, reward);
        }
    }

    /// @notice Withdraw all and claim rewards
    function exit() external {
        uint256 balance = balances[msg.sender];
        if (balance > 0) {
            withdraw(balance);
        }
        getReward();
    }

    // Admin

    /// @notice Set reward rate (tokens per second, 18 decimals)
    /// @dev Call this AFTER funding the contract with reward tokens
    function setRewardRate(uint256 _rewardRate)
        external
        onlyOwner
        updateReward(address(0))
    {
        rewardRate = _rewardRate;
        emit RewardRateUpdated(_rewardRate);
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }

    /// @notice Rescue tokens accidentally sent here (but not staking/reward token)
    function rescueTokens(
        address token,
        uint256 amount,
        address to
    ) external onlyOwner {
        require(token != address(stakingToken), "Cannot rescue staking token");
        require(token != address(rewardToken), "Cannot rescue reward token");
        IERC20(token).transfer(to, amount);
    }
}
