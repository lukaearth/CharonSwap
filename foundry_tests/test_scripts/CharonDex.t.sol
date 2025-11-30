// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CharonDex.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// -----------------------------
// Mock Token
// -----------------------------
contract MockToken is ERC20 {
    constructor(string memory n, string memory s) ERC20(n, s) {}
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

// -----------------------------
// Test Suite
// -----------------------------
contract CharonDexTest is Test {
    MockToken tokenA;
    MockToken tokenB;
    CharonDex dex;

    address user1 = address(0xBEEF);
    address user2 = address(0xCAFE);

    uint256 constant INIT_SUPPLY = 1_000_000 ether;

    function setUp() public {
        tokenA = new MockToken("A", "A");
        tokenB = new MockToken("B", "B");

        // enforce sorting for constructor
        address t0 = address(tokenA) < address(tokenB) ? address(tokenA) : address(tokenB);
        address t1 = address(tokenA) < address(tokenB) ? address(tokenB) : address(tokenA);

        dex = new CharonDex(t0, t1);

        // Mint tokens
        tokenA.mint(user1, INIT_SUPPLY);
        tokenB.mint(user1, INIT_SUPPLY);
        tokenA.mint(user2, INIT_SUPPLY);
        tokenB.mint(user2, INIT_SUPPLY);

        // Approvals for both users
        vm.startPrank(user1);
        tokenA.approve(address(dex), type(uint256).max);
        tokenB.approve(address(dex), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(user2);
        tokenA.approve(address(dex), type(uint256).max);
        tokenB.approve(address(dex), type(uint256).max);
        vm.stopPrank();
    }

    // -------------------------------------------------------
    // INITIALIZATION
    // -------------------------------------------------------

    function testInitState() public {
        (uint r0, uint r1) = dex.getReserves();
        assertEq(r0, 0);
        assertEq(r1, 0);
        assertEq(dex.totalSupply(), 0);
    }

    // -------------------------------------------------------
    // ADD FIRST LIQUIDITY
    // -------------------------------------------------------

    function testAddFirstLiquidity() public {
        vm.startPrank(user1);

        (uint amount0, uint amount1, uint lp) = dex.addLiquidity(100 ether, 200 ether);

        assertEq(amount0, 100 ether);
        assertEq(amount1, 200 ether);
        assertEq(lp, sqrt(100 ether * 200 ether));

        (uint r0, uint r1) = dex.getReserves();
        assertEq(r0, 100 ether);
        assertEq(r1, 200 ether);

        assertEq(dex.balanceOf(user1), lp);

        vm.stopPrank();
    }

    // -------------------------------------------------------
    // SECOND LIQUIDITY (ratio enforced)
    // -------------------------------------------------------

    function testAddSecondLiquidityRatioEnforced() public {
        vm.startPrank(user1);
        dex.addLiquidity(100 ether, 200 ether); // ratio = 1:2
        vm.stopPrank();

        // second user tries wrong ratio
        vm.startPrank(user2);
        (uint a0, uint a1, uint lp2) = dex.addLiquidity(50 ether, 200 ether);

        // ratio correction
        assertEq(a0, 50 ether);
        assertEq(a1, 100 ether);

        // lp minted proportional to existing supply
        uint lp1 = sqrt(100 ether * 200 ether);
        uint lpExpected = (50 ether * lp1) / 100 ether;
        assertEq(lp2, lpExpected);

        vm.stopPrank();
    }

    // -------------------------------------------------------
    // REMOVE LIQUIDITY
    // -------------------------------------------------------

    function testRemoveLiquidityReturnsCorrectProportion() public {
        // add liquidity
        vm.prank(user1);
        (,, uint lp1) = dex.addLiquidity(100 ether, 200 ether);

        // remove half
        vm.startPrank(user1);
        (uint out0, uint out1) = dex.removeLiquidity(lp1 / 2);

        assertEq(out0, 50 ether);
        assertEq(out1, 100 ether);

        (uint r0, uint r1) = dex.getReserves();
        assertEq(r0, 50 ether);
        assertEq(r1, 100 ether);

        vm.stopPrank();
    }

    function testRemoveLiquidityRevertsZero() public {
        vm.startPrank(user1);
        vm.expectRevert("No liquidity");
        dex.removeLiquidity(0);
        vm.stopPrank();
    }

    // -------------------------------------------------------
    // SWAPS: token0 → token1
    // -------------------------------------------------------

    function testSwapToken0ToToken1() public {
        vm.startPrank(user1);
        dex.addLiquidity(1000 ether, 1000 ether);

        address t0 = dex.token0();
        address t1 = dex.token1();

        uint before = IERC20(t1).balanceOf(user1);

        uint out = dex.swap(t0, 100 ether, 1);

        uint afterB = IERC20(t1).balanceOf(user1);
        assertEq(afterB - before, out);

        vm.stopPrank();
    }

    // -------------------------------------------------------
    // SWAPS: token1 → token0
    // -------------------------------------------------------

    function testSwapToken1ToToken0() public {
        vm.startPrank(user1);
        dex.addLiquidity(1000 ether, 1000 ether);

        address t0 = dex.token0();
        address t1 = dex.token1();

        uint before = IERC20(t0).balanceOf(user1);

        uint out = dex.swap(t1, 200 ether, 1);

        uint afterBal = IERC20(t0).balanceOf(user1);
        assertEq(afterBal - before, out);

        vm.stopPrank();
    }

    // -------------------------------------------------------
    // SLIPPAGE / INVALID INPUT
    // -------------------------------------------------------

    function testSwapRevertsOnInvalidToken() public {
        vm.startPrank(user1);
        dex.addLiquidity(100 ether, 100 ether);

        vm.expectRevert("Invalid tokenIn");
        dex.swap(address(0x999), 10 ether, 0);

        vm.stopPrank();
    }

    function testSwapRevertsZeroAmount() public {
        vm.startPrank(user1);
        dex.addLiquidity(100 ether, 100 ether);

        address t0 = dex.token0();

        vm.expectRevert("amountIn = 0");
        dex.swap(t0, 0, 0);

        vm.stopPrank();
    }

    function testSwapRevertsSlippageTooHigh() public {
        vm.startPrank(user1);
        dex.addLiquidity(1000 ether, 1000 ether);

        address t0 = dex.token0();

        // minAmountOut too high
        vm.expectRevert("Slippage too high");
        dex.swap(t0, 100 ether, 200 ether);

        vm.stopPrank();
    }

    // -------------------------------------------------------
    // FEE MATH
    // -------------------------------------------------------

    function testSwapFeeIsApplied() public {
        vm.startPrank(user1);
        dex.addLiquidity(1000 ether, 1000 ether);

        address t0 = dex.token0();

        uint amountIn = 100 ether;
        uint amountInWithFee = (amountIn * 997) / 1000;

        uint reserve0 = 1000 ether;
        uint reserve1 = 1000 ether;

        uint expectedOut = (amountInWithFee * reserve1) / (reserve0 + amountInWithFee);

        uint actualOut = dex.swap(t0, amountIn, 1);

        assertEq(actualOut, expectedOut);

        vm.stopPrank();
    }

    // -------------------------------------------------------
    // K INVARIANT
    // -------------------------------------------------------

function testInvariant_KAfterSwap() public {
    // Use the test contract itself as the LP + trader
    MockToken t0 = MockToken(dex.token0());
    MockToken t1 = MockToken(dex.token1());

    // Mint liquidity tokens to this contract
    t0.mint(address(this), 2000 ether);
    t1.mint(address(this), 2000 ether);

    // Approve DEX to pull from this contract
    t0.approve(address(dex), type(uint256).max);
    t1.approve(address(dex), type(uint256).max);

    // Add liquidity
    dex.addLiquidity(1000 ether, 1000 ether);

    (uint256 r0_before, uint256 r1_before) = dex.getReserves();

    // Swap token0 → token1 from this contract
    dex.swap(dex.token0(), 100 ether, 1);

    (uint256 r0_after, uint256 r1_after) = dex.getReserves();

    uint256 k_before = r0_before * r1_before;
    uint256 k_after = r0_after * r1_after;

    // With fees, k should not decrease
    assertGe(k_after, k_before, "K invariant decreased");
}





    // -------------------------------------------------------
    // FUZZING SWAPS
    // -------------------------------------------------------

function testFuzzSwap(uint96 amountIn) public {
    vm.assume(amountIn > 1e12);          // avoid dust trades
    vm.assume(amountIn < 1000 ether);    // keep reasonable

    vm.prank(user1);
    dex.addLiquidity(2000 ether, 2000 ether);

    vm.startPrank(user1);
    IERC20(dex.token0()).approve(address(dex), type(uint256).max);
    IERC20(dex.token1()).approve(address(dex), type(uint256).max);

    dex.swap(dex.token0(), amountIn, 0);

    vm.stopPrank();
}

    // -------------------------------------------------------
    // INTERNAL UTIL
    // -------------------------------------------------------

    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
