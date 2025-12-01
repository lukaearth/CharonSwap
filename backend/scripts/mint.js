const { ethers } = require("hardhat");

async function main() {
  const charonAddress = "0x1Cf7355a7cfD8Fa9718ABF77873D384995eed6aa";
  const Charon = await ethers.getContractFactory("Charon");
  const charon = Charon.attach(charonAddress);

  const mintAmount = ethers.utils.parseEther("10000009"); // 10,000,009 CHR
  const tx = await charon.mint("0x14e20cf1a9e7344721b48fd40d6f800ba9cbb314", mintAmount);
  await tx.wait();

  console.log("Minted:", mintAmount.toString());
}

main().catch(console.error);
