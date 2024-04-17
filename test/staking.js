const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { MIN_TIME_DELAY, ZERO_ADDRESS, HUNDRED_TOKENS, SIX_MONTHS, ONE_YEAR } = require("./constants");
require("@nomicfoundation/hardhat-chai-matchers");
const {deployContractFixture} = require("./fixtures");
const { increase } = require("@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time");

describe("Testing staking", () => {
    it("should staking 100 tokens successfully", async () => {
        const [
            stakingTokenContract,
            rewardTokenContract,
            stakingContract,
            owner,
            staker
        ] = await loadFixture(deployContractFixture);
        const stakerBalBeforeStaking = await stakingTokenContract.balanceOf(staker.address);
        const contractBalBeforeStaking = await stakingTokenContract.balanceOf(stakingContract.address);
        const approveTx = await stakingTokenContract.connect(staker).approve(stakingContract.address, HUNDRED_TOKENS);
        await approveTx.wait();
        const stakeTx = await stakingContract.connect(staker).stake(HUNDRED_TOKENS, SIX_MONTHS);
        await stakeTx.wait();

        const stakerBalAfterStaking = await stakingTokenContract.balanceOf(staker.address);
        const contractBalAfterStaking = await stakingTokenContract.balanceOf(stakingContract.address);

        expect(stakerBalBeforeStaking.sub(stakerBalAfterStaking).eq(ethers.BigNumber.from(HUNDRED_TOKENS))).to.be.true;
        expect(contractBalAfterStaking.sub(contractBalBeforeStaking).eq(ethers.BigNumber.from(HUNDRED_TOKENS))).to.be.true;

        const rtBal = await rewardTokenContract.balanceOf(stakingContract.address);
        expect(rtBal.toString()).to.equal(HUNDRED_TOKENS);
    });

    it("should test ownership of staking contract", async () => {
        const [
            stakingTokenContract,
            rewardTokenContract,
            stakingContract,
            owner,
            staker
        ] = await loadFixture(deployContractFixture);

        const _owner = await stakingContract.owner();

        expect(_owner).to.be.equal(owner.address);
    });

    it("should change ownership in two steps", async () => {
        const [
            stakingTokenContract,
            rewardTokenContract,
            stakingContract,
            owner,
            staker
        ] = await loadFixture(deployContractFixture);

        const signers = await ethers.getSigners();
        const newOwner = signers[2];

        const transferTx = await stakingContract.connect(owner).transferOwnership(newOwner.address);
        await transferTx.wait();

        let pendingOwner = await stakingContract.pendingOwner();

        expect(pendingOwner).to.be.equal(newOwner.address);

        const acceptTx = await stakingContract.connect(newOwner).acceptOwnership();
        await acceptTx.wait();

        const _owner = await stakingContract.owner();
        expect(_owner).to.be.equal(newOwner.address);

        pendingOwner = await stakingContract.pendingOwner();
        expect(pendingOwner).to.be.equal(ZERO_ADDRESS);
    });

    it("should get all stakes", async () => {
        const [
            stakingTokenContract,
            rewardTokenContract,
            stakingContract,
            owner,
            staker
        ] = await loadFixture(deployContractFixture);
        await increase(+SIX_MONTHS);

        const approveTx = await stakingTokenContract.connect(staker).approve(stakingContract.address, HUNDRED_TOKENS);
        await approveTx.wait();
        const stakeTx = await stakingContract.connect(staker).stake(HUNDRED_TOKENS, SIX_MONTHS);
        await stakeTx.wait();

        const stakes = await stakingContract.getAllStakes(staker.address);
        const stake = stakes[0];

        const _stake = await stakingContract.getStakeById(staker.address, 0);

        expect(stake.amount).to.be.equal(_stake.amount);
    });

    it("should get rewards after 6 months of staking", async () => {
        const [
            stakingTokenContract,
            rewardTokenContract,
            stakingContract,
            owner,
            staker
        ] = await loadFixture(deployContractFixture);

        const approveTx = await stakingTokenContract.connect(staker).approve(stakingContract.address, HUNDRED_TOKENS);
        await approveTx.wait();
        const stakeTx = await stakingContract.connect(staker).stake(HUNDRED_TOKENS, ONE_YEAR);
        await stakeTx.wait();

        await increase(+ONE_YEAR/2);

        const rewards = await stakingContract.getRewards(staker.address, 0);
        expect(rewards.toString()).to.be.equal("12500000000000000000");
    });

    it("should claim rewards successfully 2 times for 1 year locking", async () => {
        const [
            stakingTokenContract,
            rewardTokenContract,
            stakingContract,
            owner,
            staker
        ] = await loadFixture(deployContractFixture);

        const approveTx = await stakingTokenContract.connect(staker).approve(stakingContract.address, HUNDRED_TOKENS);
        await approveTx.wait();
        const stakeTx = await stakingContract.connect(staker).stake(HUNDRED_TOKENS, ONE_YEAR);
        await stakeTx.wait();

        let blockTimestamp = await increase(+ONE_YEAR/2);

        const rewards = await stakingContract.getRewards(staker.address, 0);

        expect(rewards.toString()).to.be.equal("12500000000000000000");

        let balBefore = await rewardTokenContract.balanceOf(staker.address);

        const claimTx = await stakingContract.connect(staker).claimRewards(0);
        const confirmedTx = await claimTx.wait();
        await expect(claimTx).to.emit(stakingContract, "Claimed").withArgs(
            staker.address, "12500000000000000000", 0
        );

        let balAfter = await rewardTokenContract.balanceOf(staker.address);

        expect(balAfter.sub(balBefore).toString()).to.be.equal("12500000000000000000");

        const stake = await stakingContract.getStakeById(staker.address, 0);

        expect(stake.rewardsCollected.toString()).to.be.equal("12500000000000000000");
        expect(stake.claimed.toString()).to.be.equal(`${blockTimestamp + 1}`);

        balBefore = await rewardTokenContract.balanceOf(staker.address);
        blockTimestamp = await increase(+ONE_YEAR/2);
        const rewards2 = await stakingContract.getRewards(staker.address, 0);
        const claimTx2 = await stakingContract.connect(staker).claimRewards(0);
        await claimTx2.wait();
        expect(rewards2.toString()).to.be.equal("37500000000000000000");
        balAfter = await rewardTokenContract.balanceOf(staker.address);
        expect(balAfter.sub(balBefore).toString()).to.be.equal("37500000000000000000");
        expect(balAfter.toString()).to.be.equal("50000000000000000000");
    });

    it("should unstake tokens successfully", async () => {
        const [
            stakingTokenContract,
            rewardTokenContract,
            stakingContract,
            owner,
            staker
        ] = await loadFixture(deployContractFixture);

        const approveTx = await stakingTokenContract.connect(staker).approve(stakingContract.address, HUNDRED_TOKENS);
        await approveTx.wait();
        const stakeTx = await stakingContract.connect(staker).stake(HUNDRED_TOKENS, ONE_YEAR);

        await expect(stakeTx).to.emit(stakingContract, "Staked").withArgs(
            staker.address,
            HUNDRED_TOKENS,
            0
        );

        await increase(+ONE_YEAR);
        
        const stBalBefore = await stakingTokenContract.balanceOf(staker.address);
        const rtBalBefore = await rewardTokenContract.balanceOf(staker.address);

        const unstakeTx = await stakingContract.connect(staker).unstake("0");
        await expect(unstakeTx).to.emit(stakingContract, "Unstaked").withArgs(
            staker.address,
            0
        );

        const stBalAfter = await stakingTokenContract.balanceOf(staker.address);
        const rtBalAfter = await rewardTokenContract.balanceOf(staker.address);

        expect(stBalAfter.sub(stBalBefore).toString()).to.be.equal("100000000000000000000");
        expect(rtBalAfter.sub(rtBalBefore)).to.be.equal("50000000000000000000");

        const stakes = await stakingContract.getAllStakes(staker.address);
        expect(stakes.length).to.be.equal(0);
    });

    it("should revert staking when it is paused", async () => {
        const [
            stakingTokenContract,
            rewardTokenContract,
            stakingContract,
            owner,
            staker
        ] = await loadFixture(deployContractFixture);

        const paused = await stakingContract.isStakingPaused();
        expect(paused).to.be.false;

        const pausedTx = await stakingContract.pauseUnpauseStaking();
        await expect(pausedTx).to.emit(stakingContract, "PausedOrUnpausedStaking");

        const _paused = await stakingContract.isStakingPaused();
        expect(_paused).to.be.true;

        const approveTx = await stakingTokenContract.connect(staker).approve(stakingContract.address, HUNDRED_TOKENS);
        await approveTx.wait();
        const stakeTx = stakingContract.connect(staker).stake(HUNDRED_TOKENS, ONE_YEAR);

        await expect(stakeTx).to.be.revertedWithCustomError(stakingContract, "StakingPaused");
    });

    it("should revert unstaking when it is paused", async () => {
        const [
            stakingTokenContract,
            rewardTokenContract,
            stakingContract,
            owner,
            staker
        ] = await loadFixture(deployContractFixture);

        const paused = await stakingContract.isUnstakingPaused();
        expect(paused).to.be.false;

        const pausedTx = await stakingContract.pauseUnpauseUnstaking();
        await expect(pausedTx).to.emit(stakingContract, "PausedOrUnpausedUnstaking");

        const _paused = await stakingContract.isUnstakingPaused();
        expect(_paused).to.be.true;

        const stakeTx = stakingContract.connect(staker).unstake("0");
        await expect(stakeTx).to.be.revertedWithCustomError(stakingContract, "UnstakingPaused");
    });

    it("should revert when tried to claim before", async () => {
        const [
            stakingTokenContract,
            rewardTokenContract,
            stakingContract,
            owner,
            staker
        ] = await loadFixture(deployContractFixture);

        const approveTx = await stakingTokenContract.connect(staker).approve(stakingContract.address, HUNDRED_TOKENS);
        await approveTx.wait();
        const stakeTx = await stakingContract.connect(staker).stake(HUNDRED_TOKENS, ONE_YEAR);
        await expect(stakeTx).to.emit(stakingContract, "Staked").withArgs(
            staker.address,
            HUNDRED_TOKENS,
            0
        );

        const claimTx = stakingContract.connect(staker).claimRewards("0");
        await expect(claimTx).to.be.revertedWithCustomError(stakingContract, "ClaimDelayNotExpired");
    });
});