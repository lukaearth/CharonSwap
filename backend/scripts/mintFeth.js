const { ethers } = require("hardhat");

async function main() {
  const charonAddress = "0xeF84b001145F02937020bC757f771075f6bB1923";
  const Charon = await ethers.getContractFactory("FakeETH");
  const charon = Charon.attach(charonAddress);

  const mintAmount = ethers.utils.parseEther("10000"); // mint 10,000,000 CHR
  const tx = await charon.mint("0x14e20cf1a9e7344721b48fd40d6f800ba9cbb314", mintAmount);
  await tx.wait();

  console.log("Minted:", mintAmount.toString());
}

main().catch(console.error);
