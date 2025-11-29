const { ethers } = require("hardhat");

async function main() {
  const dexAddress = "0x2BdA2Ab20D679f8EE829DFe531De3659D4c260Ae";

  const [signer] = await ethers.getSigners();
  const dex = await ethers.getContractAt("CharonDex", dexAddress, signer);

  const amountCHR = ethers.utils.parseEther("1000000"); // 1M CHR
  const amountFETH = ethers.utils.parseEther("1");       // 1 FETH

  console.log("Adding liquidity...");
  const tx = await dex.addLiquidity(amountCHR, amountFETH);
  await tx.wait();

  console.log("Liquidity added!");
}

main().catch(console.error);
