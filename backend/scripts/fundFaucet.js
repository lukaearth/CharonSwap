const { ethers } = require("hardhat");

const FAUCET = "0xC6C85531c7cFA380A669eddf1a22213c268c7A90";
const CHR = "0x1Cf7355a7cfD8Fa9718ABF77873D384995eed6aa";
const FETH = "0xeF84b001145F02937020bC757f771075f6bB1923";

async function main() {
  const [owner] = await ethers.getSigners();

  const chr = await ethers.getContractAt("Charon", CHR);
  const feth = await ethers.getContractAt("FakeETH", FETH);


  console.log("Transferring tokens to faucet...");

  await (await chr.transfer(FAUCET, ethers.utils.parseUnits("10000000", 18))).wait();
  await (await feth.transfer(FAUCET, ethers.utils.parseUnits("1000", 18))).wait();

  console.log("🎉 Faucet funded successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
