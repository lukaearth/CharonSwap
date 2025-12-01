const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying CharonStaking...");

  // Update with your CHR token address before deploying
  const CHR_TOKEN = "0x1Cf7355a7cfD8Fa9718ABF77873D384995eed6aa";

  const Staking = await ethers.getContractFactory("CharonStaking");
  const staking = await Staking.deploy(CHR_TOKEN);

  await staking.deployed();

  console.log("CharonStaking deployed at:", staking.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
