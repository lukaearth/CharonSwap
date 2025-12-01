// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Charon Locked Staking v2
/// @notice Lock CHR in fixed-term pools (30/90/180 days) with boosted rewards.
contract CharonStakingLocked is Ownable, ReentrancyGuard {
    IERC20 public immutable stakingToken; // CHR
    IERC20 public immutable rewardToken;  // CHR

    struct Pool {
        uint256 duration;       // in seconds
        uint256 rewardRate;     // tokens per second per 1e18 staked (18 decimals)
        uint256 totalSupply;    // total staked in this pool
        uint256 rewardPerTokenStored;
        uint256 lastUpdateTime;
        bool active;
    }

    // 0 = 30d, 1 = 90d, 2 = 180d (configurable)
    mapping(uint8 => Pool) public pools;

    // user => poolId => stake data
    struct UserStake {
        uint256 balance;
        uint256 rewardPerTokenPaid;
        uint256 rewards;
        uint256 unlockTime;
    }

    mapping(address => mapping(uint8 => UserStake)) public userStakes;

    bool public paused;

    event PoolConfigured(uint8 indexed poolId, uint256 duration, uint256 rewardRate, bool active);
    event Staked(address indexed user, uint8 indexed poolId, uint256 amount, uint256 unlockTime);
    event Withdrawn(address indexed user, uint8 indexed poolId, uint256 amount);
    event RewardPaid(address indexed user, uint8 indexed poolId, uint256 reward);
    event Paused(bool paused);

    constructor(address _stakingToken) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid token");
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_stakingToken);

        // Default pools; reward rates get configured after funding
        _configurePool(0, 30 days, 0, true);
        _configurePool(1, 90 days, 0, true);
        _configurePool(2, 180 days, 0, true);
    }

    modifier notPaused() {
        require(!paused, "Staking is paused");
        _;
    }

    modifier updateReward(address account, uint8 poolId) {
        Pool storage pool = pools[poolId];
        require(pool.active, "Pool inactive");

        pool.rewardPerTokenStored = rewardPerToken(poolId);
        pool.lastUpdateTime = block.timestamp;

        if (account != address(0)) {
            UserStake storage st = userStakes[account][poolId];
            st.rewards = earned(account, poolId);
            st.rewardPerTokenPaid = pool.rewardPerTokenStored;
        }
        _;
    }

    function _configurePool(
        uint8 poolId,
        uint256 duration,
        uint256 rewardRate,
        bool active
    ) internal {
        pools[poolId].duration = duration;
        pools[poolId].rewardRate = rewardRate;
        pools[poolId].active = active;
        if (pools[poolId].lastUpdateTime == 0) {
            pools[poolId].lastUpdateTime = block.timestamp;
        }
        emit PoolConfigured(poolId, duration, rewardRate, active);
    }

    /// @notice Admin: configure a lock pool
    function configurePool(
        uint8 poolId,
        uint256 duration,
        uint256 rewardRate,
        bool active
    ) external onlyOwner updateReward(address(0), poolId) {
        _configurePool(poolId, duration, rewardRate, active);
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }

    /// @notice View: rewardPerToken for a pool
    function rewardPerToken(uint8 poolId) public view returns (uint256) {
        Pool storage pool = pools[poolId];
        if (pool.totalSupply == 0) return pool.rewardPerTokenStored;
        uint256 elapsed = block.timestamp - pool.lastUpdateTime;
        return pool.rewardPerTokenStored + ((elapsed * pool.rewardRate * 1e18) / pool.totalSupply);
    }

    /// @notice View: earned rewards for user in a pool
    function earned(address account, uint8 poolId) public view returns (uint256) {
        Pool storage pool = pools[poolId];
        UserStake storage st = userStakes[account][poolId];

        return
            (st.balance * (rewardPerToken(poolId) - st.rewardPerTokenPaid)) /
            1e18 +
            st.rewards;
    }

    /// @notice Stake CHR into a pool (0/1/2)
    function stake(uint8 poolId, uint256 amount)
        external
        nonReentrant
        notPaused
        updateReward(msg.sender, poolId)
    {
        require(amount > 0, "Cannot stake 0");
        Pool storage pool = pools[poolId];
        require(pool.active, "Pool inactive");

        UserStake storage st = userStakes[msg.sender][poolId];

        // Restart the lock timer from this deposit
        st.unlockTime = block.timestamp + pool.duration;

        pool.totalSupply += amount;
        st.balance += amount;

        require(
            stakingToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        emit Staked(msg.sender, poolId, amount, st.unlockTime);
    }

    /// @notice Withdraw staked CHR after lock expires
    function withdraw(uint8 poolId, uint256 amount)
        public
        nonReentrant
        updateReward(msg.sender, poolId)
    {
        require(amount > 0, "Cannot withdraw 0");
        UserStake storage st = userStakes[msg.sender][poolId];
        require(st.balance >= amount, "Insufficient staked");
        require(block.timestamp >= st.unlockTime, "Lock not expired");

        Pool storage pool = pools[poolId];

        pool.totalSupply -= amount;
        st.balance -= amount;

        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");

        emit Withdrawn(msg.sender, poolId, amount);
    }

    /// @notice Claim pending rewards from a pool (no unlock requirement)
    function getReward(uint8 poolId)
        public
        nonReentrant
        updateReward(msg.sender, poolId)
    {
        UserStake storage st = userStakes[msg.sender][poolId];
        uint256 reward = st.rewards;
        if (reward > 0) {
            st.rewards = 0;
            require(
                rewardToken.transfer(msg.sender, reward),
                "Reward transfer failed"
            );
            emit RewardPaid(msg.sender, poolId, reward);
        }
    }

    /// @notice Exit a pool: withdraw all (if unlocked) + claim reward
    function exit(uint8 poolId) external {
        UserStake storage st = userStakes[msg.sender][poolId];
        uint256 bal = st.balance;
        if (bal > 0 && block.timestamp >= st.unlockTime) {
            withdraw(poolId, bal);
        }
        getReward(poolId);
    }

    /// @notice Rescue wrong tokens (not CHR)
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
