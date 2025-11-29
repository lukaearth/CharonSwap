const { ethers } = require("hardhat");

async function main() {
  const dex = await ethers.getContractAt(
    "CharonDexV3",
    "0xD9cc2A958B043fC310001d0276AFe0Fc0c38b4F1"
  );

  const reserve0 = await dex.reserve0();
  const reserve1 = await dex.reserve1();

  console.log("reserve0:", reserve0.toString());
  console.log("reserve1:", reserve1.toString());
}

main();
