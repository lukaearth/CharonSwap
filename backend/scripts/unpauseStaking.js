const hre = require("hardhat");

async function main() {
  const STAKING_ADDRESS = "0x89519D9E2aE3B945a5Bdeb18C24eAE0c85feD9bD";
  const staking = await hre.ethers.getContractAt("CharonStaking", STAKING_ADDRESS);

  console.log("Unpausing staking...");
  const tx = await staking.setPaused(false);
  await tx.wait();

  console.log("Staking is now UNPAUSED.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
