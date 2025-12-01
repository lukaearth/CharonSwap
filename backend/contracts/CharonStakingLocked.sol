// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Locked staking where longer commitments earn higher rates
contract CharonStakingLocked is Ownable, ReentrancyGuard {
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;

    struct Pool {
        uint256 duration;
        uint256 rewardRate;  // tokens per second per 1e18 staked
        uint256 totalSupply;
        uint256 rewardPerTokenStored;
        uint256 lastUpdateTime;
        bool active;
    }

    // Pool 0 = 30 days, 1 = 90 days, 2 = 180 days (but owner can reconfigure)
    mapping(uint8 => Pool) public pools;

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

        // Preload common lock terms; reward rates get funded later
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

    // Owner can adjust pools or add new lock terms
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

    function rewardPerToken(uint8 poolId) public view returns (uint256) {
        Pool storage pool = pools[poolId];
        if (pool.totalSupply == 0) return pool.rewardPerTokenStored;
        uint256 elapsed = block.timestamp - pool.lastUpdateTime;
        return pool.rewardPerTokenStored + ((elapsed * pool.rewardRate * 1e18) / pool.totalSupply);
    }

    function earned(address account, uint8 poolId) public view returns (uint256) {
        UserStake storage st = userStakes[account][poolId];
        uint256 delta = rewardPerToken(poolId) - st.rewardPerTokenPaid;
        return (st.balance * delta) / 1e18 + st.rewards;
    }

    // Each deposit refreshes the lock, so the full balance shares one unlock time
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

        // Restart the lock window for the entire position
        st.unlockTime = block.timestamp + pool.duration;

        pool.totalSupply += amount;
        st.balance += amount;

        require(
            stakingToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        emit Staked(msg.sender, poolId, amount, st.unlockTime);
    }

    // Withdraw only after the lock expires
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

    // Rewards remain claimable even while locked
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

    // Withdraw what is unlocked and claim rewards in one call
    function exit(uint8 poolId) external {
        UserStake storage st = userStakes[msg.sender][poolId];
        uint256 bal = st.balance;
        if (bal > 0 && block.timestamp >= st.unlockTime) {
            withdraw(poolId, bal);
        }
        getReward(poolId);
    }

    // Emergency escape hatch for unrelated tokens
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
