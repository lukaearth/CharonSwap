const hre = require("hardhat");

async function main() {
  const CHR_ADDRESS = "0x1Cf7355a7cfD8Fa9718ABF77873D384995eed6aa";
  const FETH_ADDRESS = "0xeF84b001145F02937020bC757f771075f6bB1923";

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying faucet with:", deployer.address);

  const Faucet = await hre.ethers.getContractFactory("CharonFaucet");
  const faucet = await Faucet.deploy(CHR_ADDRESS, FETH_ADDRESS);

  await faucet.deployed();

  console.log("CharonFaucet deployed at:", faucet.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
