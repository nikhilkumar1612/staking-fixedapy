const {ethers} = require("hardhat");
const { ERC20_MINT_AMOUNT, SEVEN_DAYS, ONE_YEAR, FIXED_APY, LOCK_MULTIPLIER, HUNDRED_TOKENS } = require("./constants");

async function deployContractFixture() {
    const signers = await ethers.getSigners();
    const StakingTokenContract = await ethers.getContractFactory("Token", signers[0]);
    const stakingTokenContract = await StakingTokenContract.deploy();

    const RewardTokenContract = await ethers.getContractFactory("RewardToken", signers[0]);
    const rewardTokenContract = await RewardTokenContract.deploy();

    const StakingContract = await ethers.getContractFactory("StakingContract", signers[0]);
    const stakingContract = await StakingContract.deploy(
        stakingTokenContract.address,
        rewardTokenContract.address,
        ONE_YEAR,
        SEVEN_DAYS,
        LOCK_MULTIPLIER,
        FIXED_APY
    );

    const owner = signers[0];
    const staker = signers[1];

    const mintTx = await stakingTokenContract.mint(staker.address, HUNDRED_TOKENS);
    await mintTx.wait();

    const mintTx2 = await rewardTokenContract.mint(stakingContract.address, HUNDRED_TOKENS);
    await mintTx2.wait();

    return [stakingTokenContract, rewardTokenContract, stakingContract, owner, staker];
}

module.exports = {
    deployContractFixture
};