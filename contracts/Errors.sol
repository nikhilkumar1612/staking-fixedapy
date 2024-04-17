// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// Error thrown when trying to stake when it is paused.
error StakingPaused();

// Error thrown when trying to lock assets for a time period greater than max locking period.
error InvalidLockingPeriod();

// Error thrown when stake Id is invalid.
error InvalidStakeId(address, uint256);

// Error thrown when trying to unstake when it is paused.
error UnstakingPaused();

// Error thrown when trying to unstake before lock period has expired.
error InvalidUnstakeTime(address, uint256);

// Error jthrown when trying to claim tokens before the claim delay has expired.
error ClaimDelayNotExpired(address, uint256);