// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.17;


import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {IStakingManager} from "./interfaces/IStakingManager.sol";
contract StakingManager is IStakingManager, Ownable2Step{
    // to maintain decimal precision for APY.
    uint256 public constant FIXED_APY_PRECISION = 100;

    // to maintain decimal precision for Lock Multiplier.
    uint256 public constant LOCK_MULTIPLIER_PRECISION = 100000;

    // number of seconds which represents max period of locking.
    uint256 public MAX_LOCKING_PERIOD;

    // number of seconds which represents claim delay between claims.
    uint256 public CLAIM_DELAY;

    // multiplier to increase rewards.
    uint256 public LOCK_MULTIPLIER;

    // fixed apy to accumulate rewards.
    uint256 public FIXED_APY;

    // boolean which indicates if staking has paused.
    bool public isStakingPaused;

    // boolean which indicates if unstaking has paused.
    bool public isUnstakingPaused;

    // emitted when Apy changes.
    event ApyChanged(uint256 newApy);

    // emitted when claim delay changes.
    event ClaimDelayChanged(uint256 newClaimDelay);

    // emitted when lock multiplier changes.
    event LockMultiplierChanged(uint256 newMaxMultiplier);

    // emitted when max locking period changes.
    event MaxLockingPeriodChanged(uint256 newMaxLockingPeriod);

    // emitted when unstaking has paused/unpaused.
    event PausedOrUnpausedUnstaking();

    // emitted when staking has paused/unpaused.
    event PausedOrUnpausedStaking();

    constructor(
        uint256 _maxLockingPeriod,
        uint256 _claimDelay,
        uint256 _lockMultiplier,
        uint256 _fixedApy
    ) {
        MAX_LOCKING_PERIOD = _maxLockingPeriod;
        CLAIM_DELAY = _claimDelay;
        LOCK_MULTIPLIER = _lockMultiplier;
        FIXED_APY = _fixedApy;
    }

    /**
     * @inheritdoc IStakingManager
     */
    function updateMaxLockingPeriod(
        uint256 _newMaxLockingPeriod
    )
      external
      onlyOwner()
    {
        MAX_LOCKING_PERIOD = _newMaxLockingPeriod;
        emit MaxLockingPeriodChanged(_newMaxLockingPeriod);
    }

    /**
     * @inheritdoc IStakingManager
     */
    function updateClaimDelay(
        uint256 _newClaimDelay
    )
      external
      onlyOwner()
    {
        CLAIM_DELAY = _newClaimDelay;
        emit ClaimDelayChanged(_newClaimDelay);
    }

    /**
     * @inheritdoc IStakingManager
     */
    function updateLockMultiplier(
        uint256 _newLockMultiplier
    )
      external
      onlyOwner()
    {
        LOCK_MULTIPLIER = _newLockMultiplier;
        emit LockMultiplierChanged(_newLockMultiplier);
    }

    /**
     * @inheritdoc IStakingManager
     */
    function updateApy(
        uint256 _newFixedApy
    )
      external
      onlyOwner()
    {
        FIXED_APY = _newFixedApy;
        emit ApyChanged(_newFixedApy);
    }

    /**
     * @inheritdoc IStakingManager
     */
    function pauseUnpauseStaking() 
        external 
        onlyOwner()
    {
        isStakingPaused = !isStakingPaused;
        emit PausedOrUnpausedStaking();
    }

    /**
     * @inheritdoc IStakingManager
     */
    function pauseUnpauseUnstaking()
        external
        onlyOwner()
    {
        isUnstakingPaused = !isUnstakingPaused;
        emit PausedOrUnpausedUnstaking();
    }
}