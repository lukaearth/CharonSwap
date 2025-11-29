const hre = require("hardhat");

async function main() {
  const CHR = "0x1Cf7355a7cfD8Fa9718ABF77873D384995eed6aa";
  const FETH = "0xeF84b001145F02937020bC757f771075f6bB1923";
  const TREASURY = "0x14e20cf1a9e7344721b48fd40d6f800ba9cbb314";

  const protocolFee = 1; // 0.1% to treasury
  // total swapFee defaults to 0.3% (3), so LPs get 0.2%

  const Dex = await hre.ethers.getContractFactory("CharonDexV3");
  const dex = await Dex.deploy(CHR, FETH, TREASURY, protocolFee);

  await dex.deployed();
  console.log("CharonDex V3 deployed at:", dex.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
