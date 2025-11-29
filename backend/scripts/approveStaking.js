const { ethers } = require("hardhat");

async function main() {
  const CHR = await ethers.getContractAt(
    "ERC20",
    "0x1Cf7355a7cfD8Fa9718ABF77873D384995eed6aa"
  );

  const STAKING_ADDR = "0x89519D9E2aE3B945a5Bdeb18C24eAE0c85feD9bD";

  const tx = await CHR.approve(STAKING_ADDR, ethers.constants.MaxUint256);
  console.log("Approval tx sent:", tx.hash);

  await tx.wait();
  console.log("Approved CHR for staking");
}

main();
