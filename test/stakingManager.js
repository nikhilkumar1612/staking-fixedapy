const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { FIXED_APY, LOCK_MULTIPLIER, SEVEN_DAYS, ONE_YEAR } = require("./constants");
require("@nomicfoundation/hardhat-chai-matchers");
const {deployContractFixture} = require("./fixtures");
const { increase } = require("@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time");

describe("Staking Manager", () => {
    it("should get fixed apy, lock multiplier, claim delay and max locking period", async () => {
        const [
            stakingTokenContract,
            rewardTokenContract,
            stakingContract,
            owner,
            staker
        ] = await loadFixture(deployContractFixture);

        const fixedApy = await stakingContract.FIXED_APY()
        const lockMultiplier = await stakingContract.LOCK_MULTIPLIER();
        const claimDelay = await stakingContract.CLAIM_DELAY();
        const maxLockingPeriod = await stakingContract.MAX_LOCKING_PERIOD();

        expect(fixedApy.toString()).to.be.equal(FIXED_APY);
        expect(lockMultiplier.toString()).to.be.equal(LOCK_MULTIPLIER);
        expect(claimDelay.toString()).to.be.equal(SEVEN_DAYS);
        expect(maxLockingPeriod.toString()).to.be.equal(ONE_YEAR);
    });

    it("should change apy", async () => {
        const [
            stakingTokenContract,
            rewardTokenContract,
            stakingContract,
            owner,
            staker
        ] = await loadFixture(deployContractFixture);

        const newApy = "800";
        const changeApyTx = await stakingContract.connect(owner).updateApy(newApy);
        await expect(changeApyTx).to.emit(stakingContract, "ApyChanged").withArgs(newApy);

        const _newApy = await stakingContract.FIXED_APY();
        expect(_newApy.toString()).to.be.equal(newApy);

        const changeApyTx2 = stakingContract.connect(staker).updateApy("600");
        await expect(changeApyTx2).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should update lock multiplier", async () => {
        const [
            stakingTokenContract,
            rewardTokenContract,
            stakingContract,
            owner,
            staker
        ] = await loadFixture(deployContractFixture);

        const newLockMultiplier = "400000";
        const tx = await stakingContract.connect(owner).updateLockMultiplier(newLockMultiplier);
        await expect(tx).to.emit(stakingContract, "LockMultiplierChanged").withArgs(newLockMultiplier);

        const _newLockMultiplier = await stakingContract.connect(staker).LOCK_MULTIPLIER();
        expect(_newLockMultiplier.toString()).to.be.equal(newLockMultiplier);

        const tx2 = stakingContract.connect(staker).updateLockMultiplier("600");
        await expect(tx2).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should update claim delay", async () => {
        const [
            stakingTokenContract,
            rewardTokenContract,
            stakingContract,
            owner,
            staker
        ] = await loadFixture(deployContractFixture);

        const newClaimDelay = "605000";
        const tx = await stakingContract.connect(owner).updateClaimDelay(newClaimDelay);
        await expect(tx).to.emit(stakingContract, "ClaimDelayChanged").withArgs(newClaimDelay);

        const _newClaimDelay = await stakingContract.CLAIM_DELAY();
        expect(_newClaimDelay).to.be.equal(newClaimDelay);

        const tx2 = stakingContract.connect(staker).updateClaimDelay("600");
        await expect(tx2).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should change max locking period", async () => {
        const [
            stakingTokenContract,
            rewardTokenContract,
            stakingContract,
            owner,
            staker
        ] = await loadFixture(deployContractFixture);

        const newMaxLockingPeriod = "31537000";
        const chaingeMaxLockingPeriod = await stakingContract.connect(owner).updateMaxLockingPeriod(newMaxLockingPeriod);
        await expect(chaingeMaxLockingPeriod).to.emit(stakingContract, "MaxLockingPeriodChanged").withArgs(
            newMaxLockingPeriod
        );

        const _newMaxLockingPeriod = await stakingContract.MAX_LOCKING_PERIOD();
        expect(_newMaxLockingPeriod.toString()).to.be.equal(newMaxLockingPeriod);

        const changeApyTx2 = stakingContract.connect(staker).updateMaxLockingPeriod("600");
        await expect(changeApyTx2).to.be.revertedWith("Ownable: caller is not the owner");
    });
});