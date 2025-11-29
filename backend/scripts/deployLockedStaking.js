const hre = require("hardhat");

async function main() {
  const CHR_ADDRESS = "0x1Cf7355a7cfD8Fa9718ABF77873D384995eed6aa";

  console.log("Deploying CharonStakingLocked...");

  const StakingLocked = await hre.ethers.getContractFactory("CharonStakingLocked");
  const stakingLocked = await StakingLocked.deploy(CHR_ADDRESS);

  await stakingLocked.deployed();   // <-- THIS is correct for Hardhat 2.x

  console.log("CharonStakingLocked deployed at:", stakingLocked.address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
