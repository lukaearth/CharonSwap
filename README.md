# CharonSwap

A complete full-stack Web3 DeFi application deployed on Sepolia testnet. This project demonstrates end-to-end blockchain development skills, from Solidity smart contracts to a production-ready React frontend.

## Overview

CharonSwap is a comprehensive DeFi ecosystem featuring an Automated Market Maker (AMM), staking mechanisms, and a fully custom frontend. Named after Charon, the ferryman who crosses the river Styx, this protocol moves liquidity across the blockchain—just as Charon moves souls across the river.

**This is a portfolio project showcasing my ability to build complete Web3 applications from scratch.**

## For Hirers

This repository contains everything I built:
- ✅ **Smart Contracts** - Custom Solidity contracts for AMM, staking, and token management
- ✅ **Frontend** - Full React application with wallet integration
- ✅ **Tests** - Comprehensive Foundry test suite
- ✅ **Live Demo** - Deployed on Sepolia testnet (see contract addresses below)

**You can test all functionality directly on the live site** - connect your wallet and try swapping, staking, and using the faucet!

## Features

### Automated Market Maker (AMM)
- Constant product formula (x * y = k) implementation
- 0.3% swap fee
- Liquidity pool management with LP tokens
- Real-time price calculations and slippage protection
- CHR ↔ FETH trading pair

### Staking System
- **Flexible Staking**: Stake CHR to earn CHR rewards with dynamic APR
- **Locked Staking**: Three lock pools (30/90/180 days) with boosted rewards
- Real-time reward calculations
- Admin controls for reward rate management

### Faucet
- Get free test tokens (CHR and FETH) for testing
- 12-hour cooldown per wallet
- Owner-configurable drip amounts

### Frontend
- Modern, responsive UI built with React + Tailwind CSS
- Wallet integration via RainbowKit and Wagmi
- Real-time on-chain data fetching
- Smooth animations with Framer Motion
- Price charts and analytics dashboard
- Admin panel for contract management

## Tech Stack

### Smart Contracts
- **Solidity** ^0.8.20
- **OpenZeppelin** contracts (ReentrancyGuard, Ownable, ERC20)
- **Hardhat** for development and deployment
- **Foundry** for testing

### Frontend
- **React** 18 with Vite
- **Wagmi** v2 + **RainbowKit** for wallet connections
- **Viem** for Ethereum interactions
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization

## 🌐 Live Deployment

**Network**: Sepolia Testnet

### Contract Addresses
- **CHR Token**: `0x1Cf7355a7cfD8Fa9718ABF77873D384995eed6aa`
- **FETH Token**: `0xeF84b001145F02937020bC757f771075f6bB1923`
- **DEX**: `0x2BdA2Ab20D679f8EE829DFe531De3659D4c260Ae`
- **Faucet**: `0xC6C85531c7cFA380A669eddf1a22213c268c7A90`
- **Staking**: `0x89519D9E2aE3B945a5Bdeb18C24eAE0c85feD9bD`

### How to Test
1. Connect your wallet (MetaMask, WalletConnect, etc.) to Sepolia testnet
2. Visit the Faucet page to get free CHR and FETH tokens
3. Try swapping tokens on the Swap page
4. Add liquidity to earn LP tokens
5. Stake your CHR tokens to earn rewards
6. Check the Analytics dashboard for pool statistics

## Smart Contracts

### Core Contracts

- **CharonDex** / **CharonDexV2** - AMM with constant product formula
- **CharonStaking** - Flexible staking with dynamic rewards
- **CharonStakingLocked** - Time-locked staking pools (30/90/180 days)
- **CharonFaucet** / **CharonFaucetV2** - Token distribution for testing
- **Charon (Token.sol)** - ERC20 token with ERC20Permit support
- **FakeETH** - Test ERC20 token

### Security Features
- ReentrancyGuard on all state-changing functions
- OpenZeppelin's battle-tested libraries
- Access control (Ownable pattern)
- Pausable functionality for emergency stops
- Input validation throughout

## Testing

All contracts are thoroughly tested using **Foundry**. Test files are located in `foundry_tests/test/`:

- `CharonDex.t.sol` - AMM functionality tests
- `CharonStake.t.sol` - Staking mechanism tests
- Additional test coverage for edge cases

## Skills Demonstrated

This project showcases:

- **Solidity Development**: Custom AMM, staking, and token contracts from scratch
- **DeFi Protocol Design**: Understanding of liquidity pools, constant product AMMs, reward distribution
- **Full-Stack Web3**: Smart contracts + React frontend integration
- **Web3 Tooling**: Wagmi, RainbowKit, Viem for wallet and contract interactions
- **Smart Contract Auditing**: Comprehensive Foundry test suite
- **Deployment**: Hardhat deployment scripts and network configuration
- **UI/UX Design**: Custom design system with smooth animations
- **Product Ownership**: End-to-end development from concept to deployment

## What You Can Try Out

1. **Token Swapping**: Trade CHR ↔ FETH with real-time price calculations
2. **Liquidity Provision**: Add/remove liquidity and earn LP tokens
3. **Staking**: Stake CHR in flexible or locked pools to earn rewards
4. **Faucet**: Claim test tokens (12-hour cooldown)

## Code Quality

- Clean, well-commented Solidity code
- Modular React components
- Proper error handling
- Event emissions for off-chain tracking
- Gas-optimized where possible
- Following best practices and security patterns

## Author

**Luka Turunen**
- GitHub: [@luka-turunen](https://github.com/luka-turunen)
- Built as a portfolio project to demonstrate full-stack Web3 development capabilities

## License

MIT License

## 🙏 Acknowledgments

- OpenZeppelin for secure contract libraries
- Uniswap V2 for AMM design inspiration
- The Ethereum community for excellent tooling

---

**Built with ❤️ to showcase full-stack Web3 development skills**

*"Crossing the river, one block at a time."*
