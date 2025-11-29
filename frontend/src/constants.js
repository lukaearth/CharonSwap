import charonDexAbi from './abi/CharonDex.json';
import charonAbi from './abi/Charon.json';
import fakeEthAbi from './abi/FakeETH.json';

export const CHR_ADDRESS = "0x1Cf7355a7cfD8Fa9718ABF77873D384995eed6aa";
export const FETH_ADDRESS = "0xeF84b001145F02937020bC757f771075f6bB1923";
export const DEX_ADDRESS = "0x2BdA2Ab20D679f8EE829DFe531De3659D4c260Ae";

export const DEX_ABI = charonDexAbi.abi;
export const CHR_ABI = charonAbi.abi;
export const FETH_ABI = fakeEthAbi.abi;

export const TOKENS = {
  CHR: {
    symbol: "CHR",
    address: CHR_ADDRESS,
    decimals: 18,
  },
  FETH: {
    symbol: "FETH",
    address: FETH_ADDRESS,
    decimals: 18,
  },
};
