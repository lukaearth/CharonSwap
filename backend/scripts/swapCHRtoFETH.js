const { ethers } = require("hardhat");

async function main() {
  const dexAddress = "0x2BdA2Ab20D679f8EE829DFe531De3659D4c260Ae";
  const chrAddress = "0x1Cf7355a7cfD8Fa9718ABF77873D384995eed6aa";

  const [signer] = await ethers.getSigners();
  const dex = await ethers.getContractAt("CharonDex", dexAddress, signer);

  const amountIn = ethers.utils.parseEther("1000"); // swap 1000 CHR

  console.log("Swapping 1000 CHR → FETH...");
  const tx = await dex.swap(chrAddress, amountIn, 0);
  await tx.wait();

  console.log("Swap complete!");
}

main().catch(console.error);
