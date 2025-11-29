const { ethers } = require("hardhat");

async function main() {
  const token0 = "0x1Cf7355a7cfD8Fa9718ABF77873D384995eed6aa";
  const token1 = "0xeF84b001145F02937020bC757f771075f6bB1923";

  if (token0.toLowerCase() > token1.toLowerCase()) {
    throw new Error("token0 must be < token1");
  }

  const Dex = await ethers.getContractFactory("CharonDex");
  const dex = await Dex.deploy(token0, token1);
  await dex.deployed();

  console.log("CharonDex deployed at:", dex.address);
}

main().catch(console.error);
