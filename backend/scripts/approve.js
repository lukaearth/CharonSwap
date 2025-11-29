const { ethers } = require("hardhat");

async function main() {
  const dexAddress = "0x2BdA2Ab20D679f8EE829DFe531De3659D4c260Ae";
  const chrAddress = "0x1Cf7355a7cfD8Fa9718ABF77873D384995eed6aa";
  const fethAddress = "0xeF84b001145F02937020bC757f771075f6bB1923";

  const [signer] = await ethers.getSigners();

  const CHR = await ethers.getContractAt("Charon", chrAddress, signer);
  const FETH = await ethers.getContractAt("FakeETH", fethAddress, signer);

  console.log("Approving CHR...");
  await (await CHR.approve(dexAddress, ethers.utils.parseEther("1000000"))).wait();
  console.log("Approved CHR.");

  console.log("Approving FETH...");
  await (await FETH.approve(dexAddress, ethers.utils.parseEther("100"))).wait();
  console.log("Approved FETH.");
}

main().catch(console.error);
