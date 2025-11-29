const { ethers } = require("hardhat");

async function main() {
  const FakeETH = await ethers.getContractFactory("FakeETH");
  const feth = await FakeETH.deploy();
  await feth.deployed();

  console.log("FakeETH deployed at:", feth.address);
}

main().catch(console.error);
