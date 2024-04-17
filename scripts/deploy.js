const hre = require("hardhat");
const { ONE_YEAR, SEVEN_DAYS, LOCK_MULTIPLIER, FIXED_APY } = require("./constants");


async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploying Staking Contract
  console.log("Deploying Staking contract with the account:", deployer.address);
  const StakingContract = await hre.ethers.getContractFactory("StakingContract", deployer);
  const stakingContractInstance = await StakingContract.deploy(
    process.env.ERC20_STAKING_TOKEN,
    process.env.ERC20REWARD_TOKEN,
    ONE_YEAR,
    SEVEN_DAYS,
    LOCK_MULTIPLIER,
    FIXED_APY
  );
  console.log("Deployed Address of Staking Contract instance: ", stakingContractInstance.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
