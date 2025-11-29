const { ethers } = require("hardhat");

async function main() {
  const dexAddress = "0x2BdA2Ab20D679f8EE829DFe531De3659D4c260Ae";
  const chr = "0x1Cf7355a7cfD8Fa9718ABF77873D384995eed6aa";

  const [signer] = await ethers.getSigners();

  const CHR = await ethers.getContractAt("ERC20", chr, signer);

  const allowance = await CHR.allowance(signer.address, dexAddress);

  console.log("CHR allowance → DEX:", allowance.toString());
}

main().catch(console.error);
