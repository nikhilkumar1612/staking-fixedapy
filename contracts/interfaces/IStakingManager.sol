// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.17;

interface IStakingManager {
    /**
     * @notice Function to update max locking period.
     * @param _newMaxLockingPeriod - new max locking period.
     */
    function updateMaxLockingPeriod(uint256 _newMaxLockingPeriod) external;

    /**
     * @notice Function to update claim delay.
     * @param _newClaimDelay - new claim delay.
     */
    function updateClaimDelay(uint256 _newClaimDelay) external;

    /**
     * @notice Function to update lock multiplier
     * @param _newLockMultiplier - new lock multiplier.
     */
    function updateLockMultiplier(uint256 _newLockMultiplier) external;

    /**
     * @notice Function to update Apy.
     * @param _newFixedApy - new Apy.
     */
    function updateApy(uint256 _newFixedApy) external;

    /**
     * @notice Function to pause or unpause staking. Toggles `isStakingPaused`.
     */
    function pauseUnpauseStaking() external;

    /**
     * @notice Function to pause or unpause unstaking. Toggles `isUnstakingPaused`.
     */
    function pauseUnpauseUnstaking() external;
}