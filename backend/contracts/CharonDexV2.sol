// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CharonDex is ERC20, ReentrancyGuard {
    address public immutable token0;
    address public immutable token1;

    uint256 public reserve0;
    uint256 public reserve1;

    // 0.3% swap fee - standard for most AMMs
    uint256 public constant FEE_NUMERATOR = 3;
    uint256 public constant FEE_DENOMINATOR = 1000;

    event LiquidityAdded(address indexed provider, uint256 amount0, uint256 amount1, uint256 liquidityMinted);
    event LiquidityRemoved(address indexed provider, uint256 amount0, uint256 amount1, uint256 liquidityBurned);
    event Swap(address indexed trader, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);

    constructor(address _token0, address _token1)
        ERC20("Simple AMM LP Token", "SAMMLP")
    {
        require(_token0 != address(0) && _token1 != address(0), "Invalid token");
        require(_token0 != _token1, "Tokens must be different");

        // Keep tokens in sorted order to avoid ambiguity - makes swap logic simpler
        require(_token0 < _token1, "token0 must be < token1");

        token0 = _token0;
        token1 = _token1;
    }

    function getReserves() public view returns (uint256 _reserve0, uint256 _reserve1) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
    }

    function addLiquidity(uint256 amount0Desired, uint256 amount1Desired)
        external
        nonReentrant
        returns (uint256 amount0, uint256 amount1, uint256 liquidity)
    {
        require(amount0Desired > 0 && amount1Desired > 0, "Invalid amounts");

        (uint256 _reserve0, uint256 _reserve1) = getReserves();

        if (_reserve0 == 0 && _reserve1 == 0) {
            // First LP deposit sets the initial price - they can use whatever ratio they want
            amount0 = amount0Desired;
            amount1 = amount1Desired;

            liquidity = _sqrt(amount0 * amount1);
            require(liquidity > 0, "Insufficient liquidity minted");
        } else {
            // For existing pools, we need to match the current price ratio
            uint256 amount1Optimal = (amount0Desired * _reserve1) / _reserve0;
            if (amount1Optimal <= amount1Desired) {
                amount0 = amount0Desired;
                amount1 = amount1Optimal;
            } else {
                uint256 amount0Optimal = (amount1Desired * _reserve0) / _reserve1;
                require(amount0Optimal <= amount0Desired, "Invalid liquidity ratio");
                amount0 = amount0Optimal;
                amount1 = amount1Desired;
            }

            uint256 _totalSupply = totalSupply();
            liquidity = _min(
                (amount0 * _totalSupply) / _reserve0,
                (amount1 * _totalSupply) / _reserve1
            );
            require(liquidity > 0, "Insufficient liquidity minted");
        }

        IERC20(token0).transferFrom(msg.sender, address(this), amount0);
        IERC20(token1).transferFrom(msg.sender, address(this), amount1);

        _mint(msg.sender, liquidity);
        _updateReserves();

        emit LiquidityAdded(msg.sender, amount0, amount1, liquidity);
    }

    function removeLiquidity(uint256 liquidity)
        external
        nonReentrant
        returns (uint256 amount0, uint256 amount1)
    {
        require(liquidity > 0, "No liquidity");

        (uint256 _reserve0, uint256 _reserve1) = getReserves();
        uint256 _totalSupply = totalSupply();

        amount0 = (liquidity * _reserve0) / _totalSupply;
        amount1 = (liquidity * _reserve1) / _totalSupply;

        require(amount0 > 0 && amount1 > 0, "Insufficient amounts");

        _burn(msg.sender, liquidity);
        IERC20(token0).transfer(msg.sender, amount0);
        IERC20(token1).transfer(msg.sender, amount1);
        _updateReserves();

        emit LiquidityRemoved(msg.sender, amount0, amount1, liquidity);
    }

    function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut)
        external
        nonReentrant
        returns (uint256 amountOut)
    {
        require(tokenIn == token0 || tokenIn == token1, "Invalid tokenIn");
        require(amountIn > 0, "amountIn = 0");

        bool isToken0In = (tokenIn == token0);
        (uint256 _reserveIn, uint256 _reserveOut) = isToken0In
            ? (reserve0, reserve1)
            : (reserve1, reserve0);

        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        // Handle fee-on-transfer tokens by checking actual balance received
        uint256 balanceIn = IERC20(tokenIn).balanceOf(address(this));
        uint256 actualAmountIn = balanceIn - _reserveIn;

        // Constant product AMM: x * y = k, but we take a fee so less goes into the pool
        uint256 amountInWithFee = (actualAmountIn * (FEE_DENOMINATOR - FEE_NUMERATOR)) / FEE_DENOMINATOR;
        amountOut = (amountInWithFee * _reserveOut) / (_reserveIn + amountInWithFee);

        require(amountOut >= minAmountOut, "Slippage too high");
        require(amountOut > 0, "Insufficient output");

        address tokenOut = isToken0In ? token1 : token0;
        IERC20(tokenOut).transfer(msg.sender, amountOut);
        _updateReserves();

        emit Swap(msg.sender, tokenIn, tokenOut, actualAmountIn, amountOut);
    }

    function _updateReserves() internal {
        reserve0 = IERC20(token0).balanceOf(address(this));
        reserve1 = IERC20(token1).balanceOf(address(this));
    }

    function _min(uint256 x, uint256 y) internal pure returns (uint256) {
        return x < y ? x : y;
    }

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
