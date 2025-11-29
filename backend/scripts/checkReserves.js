const { ethers } = require("hardhat");

async function main() {
  const dexAddress = "0x2BdA2Ab20D679f8EE829DFe531De3659D4c260Ae";
  const dex = await ethers.getContractAt("CharonDex", dexAddress);

  const [r0, r1] = await dex.getReserves();

  console.log("reserve0 (CHR):", r0.toString());
  console.log("reserve1 (FETH):", r1.toString());
}

main().catch(console.error);
