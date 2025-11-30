// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CharonStaking.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Simple mintable ERC20 for testing
contract MockToken is ERC20 {
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract CharonStakingTest is Test {
    MockToken internal token;
    CharonStaking internal staking;

    address internal user1 = address(0xBEEF);
    address internal user2 = address(0xCAFE);
    address internal other = address(0xDEAD);

    uint256 internal constant INITIAL_SUPPLY = 1_000_000 ether;

    function setUp() public {
        token = new MockToken("Charon", "CHR");
        staking = new CharonStaking(address(token));

        // Mint tokens to users
        token.mint(user1, INITIAL_SUPPLY);
        token.mint(user2, INITIAL_SUPPLY);

        // Mint reward buffer to staking contract
        token.mint(address(staking), INITIAL_SUPPLY);

        // Approvals
        vm.startPrank(user1);
        token.approve(address(staking), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(user2);
        token.approve(address(staking), type(uint256).max);
        vm.stopPrank();
    }

    // ----------------- Basics -----------------

    function testInitialState() public {
        assertEq(address(staking.stakingToken()), address(token));
        assertEq(address(staking.rewardToken()), address(token));
        assertEq(staking.rewardRate(), 0);
        assertEq(staking.totalSupply(), 0);
        assertEq(staking.paused(), false);
    }

    function testStakeUpdatesBalancesAndTotalSupply() public {
        uint256 amount = 100 ether;

        vm.prank(user1);
        staking.stake(amount);

        assertEq(staking.totalSupply(), amount);
        assertEq(staking.balances(user1), amount);
        assertEq(token.balanceOf(user1), INITIAL_SUPPLY - amount);
    }

    function testStakeZeroReverts() public {
        vm.prank(user1);
        vm.expectRevert(bytes("Cannot stake 0"));
        staking.stake(0);
    }

    function testStakeWhenPausedReverts() public {
        staking.setPaused(true);

        vm.prank(user1);
        vm.expectRevert(bytes("Staking is paused"));
        staking.stake(1 ether);
    }

    // ----------------- Withdraw -----------------

    function testWithdrawUpdatesBalancesAndTotalSupply() public {
        uint256 amount = 100 ether;

        vm.prank(user1);
        staking.stake(amount);

        vm.prank(user1);
        staking.withdraw(40 ether);

        assertEq(staking.totalSupply(), 60 ether);
        assertEq(staking.balances(user1), 60 ether);
    }

    function testWithdrawAll() public {
        uint256 amount = 200 ether;

        vm.prank(user1);
        staking.stake(amount);

        vm.prank(user1);
        staking.withdraw(amount);

        assertEq(staking.totalSupply(), 0);
        assertEq(staking.balances(user1), 0);
        assertEq(token.balanceOf(user1), INITIAL_SUPPLY);
    }

    function testWithdrawZeroReverts() public {
        vm.prank(user1);
        vm.expectRevert(bytes("Cannot withdraw 0"));
        staking.withdraw(0);
    }

    function testWithdrawMoreThanBalanceReverts() public {
        uint256 amount = 50 ether;

        vm.prank(user1);
        staking.stake(amount);

        vm.prank(user1);
        vm.expectRevert(bytes("Insufficient staked"));
        staking.withdraw(amount + 1);
    }

    // ----------------- rewardPerToken & earned -----------------

    function testRewardPerTokenNoSupplyDoesNotChange() public {
        uint256 beforeStored = staking.rewardPerTokenStored();

        staking.setRewardRate(1 ether);

        vm.warp(block.timestamp + 100);

        assertEq(staking.rewardPerToken(), beforeStored);
        assertEq(staking.rewardPerTokenStored(), beforeStored);
    }

    function testSingleStakerEarnedMatchesRate() public {
        uint256 stakeAmount = 100 ether;
        uint256 rate = 1 ether;

        staking.setRewardRate(rate);

        vm.prank(user1);
        staking.stake(stakeAmount);

        uint256 duration = 10;
        vm.warp(block.timestamp + duration);

        vm.prank(user1);
        staking.getReward();

        uint256 expectedReward = rate * duration;

        // user’s stake is still in the contract — they didn't withdraw it
        uint256 expectedBalance = INITIAL_SUPPLY - stakeAmount + expectedReward;

        assertEq(token.balanceOf(user1), expectedBalance);

        assertEq(staking.rewards(user1), 0);
    }


    function testEarnedViewFunction() public {
        uint256 stakeAmount = 50 ether;
        uint256 rate = 2 ether;

        staking.setRewardRate(rate);

        vm.prank(user1);
        staking.stake(stakeAmount);

        uint256 duration = 7;
        vm.warp(block.timestamp + duration);

        assertEq(staking.earned(user1), rate * duration);
    }

    function testMultipleStakersProportionalRewards() public {
        uint256 rate = 1 ether;
        staking.setRewardRate(rate);

        vm.prank(user1);
        staking.stake(100 ether);

        vm.warp(block.timestamp + 10);

        vm.prank(user2);
        staking.stake(300 ether);

        vm.warp(block.timestamp + 20);

        uint256 earned1 = staking.earned(user1);
        uint256 earned2 = staking.earned(user2);

        uint256 seg1 = 10 * rate;
        uint256 seg2Total = 20 * rate;

        uint256 seg2User1 = (seg2Total * 100) / 400;
        uint256 seg2User2 = (seg2Total * 300) / 400;

        assertEq(earned1, seg1 + seg2User1);
        assertEq(earned2, seg2User2);
    }

    // ----------------- getReward & exit -----------------

    function testGetRewardDoesNothingIfZero() public {
        vm.prank(user1);
        staking.getReward();
        assertEq(staking.rewards(user1), 0);
    }

    function testExitWithdrawsAndClaims() public {
        uint256 stakeAmount = 100 ether;
        uint256 rate = 1 ether;

        staking.setRewardRate(rate);

        vm.prank(user1);
        staking.stake(stakeAmount);

        uint256 duration = 15;
        vm.warp(block.timestamp + duration);

        vm.prank(user1);
        staking.exit();

        uint256 expectedReward = rate * duration;
        assertEq(staking.balances(user1), 0);
        assertEq(staking.totalSupply(), 0);

        assertEq(
            token.balanceOf(user1),
            INITIAL_SUPPLY + expectedReward
        );
    }

    // ----------------- Admin (corrected for OZ v5) -----------------

    function testOnlyOwnerCanSetPaused() public {
        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                user1
            )
        );
        staking.setPaused(true);
        vm.stopPrank();
    }

    function testOnlyOwnerCanSetRewardRate() public {
        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                user1
            )
        );
        staking.setRewardRate(1 ether);
        vm.stopPrank();
    }

    function testSetPausedAndUnpaused() public {
        staking.setPaused(true);
        assertTrue(staking.paused());
        staking.setPaused(false);
        assertFalse(staking.paused());
    }

    function testSetRewardRateUpdatesState() public {
        uint256 rate = 5 ether;
        staking.setRewardRate(rate);
        assertEq(staking.rewardRate(), rate);
    }

    // ----------------- rescueTokens -----------------

    // In this contract, stakingToken == rewardToken
    // So BOTH revert checks collapse into the *first* one.
    function testRescueTokensCannotRescueRewardToken() public {
        vm.expectRevert(bytes("Cannot rescue staking token"));
        staking.rescueTokens(address(token), 1 ether, other);
    }

    function testRescueTokensCannotRescueStakingToken() public {
        vm.expectRevert(bytes("Cannot rescue staking token"));
        staking.rescueTokens(address(token), 1 ether, other);
    }

    function testRescueTokensWorksForNonStakingToken() public {
        MockToken oth = new MockToken("Other", "OTH");
        oth.mint(address(staking), 1000 ether);

        staking.rescueTokens(address(oth), 500 ether, other);

        assertEq(oth.balanceOf(other), 500 ether);
        assertEq(oth.balanceOf(address(staking)), 500 ether);
    }

    // ----------------- Fuzz -----------------

    function testFuzz_StakeAndWithdraw(uint96 amount) public {
        vm.assume(amount > 0 && amount < INITIAL_SUPPLY);

        vm.prank(user1);
        staking.stake(amount);
        assertEq(staking.balances(user1), amount);

        vm.prank(user1);
        staking.withdraw(amount);
        assertEq(staking.balances(user1), 0);
    }
}
