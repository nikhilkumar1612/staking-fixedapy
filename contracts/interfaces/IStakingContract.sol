// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.17;

interface IStakingContract {
    /**
     * @notice Function to lock tokens for a time period of `_duration`.
     * @param _amount - Amount of tokens to be staked.
     * @param _duration - Duration in seconds for the tokens to be locked/staked.
     */
    function stake(uint256 _amount, uint256 _duration) external;

    /**
     * @notice Function to be called to unstake tokens, which will withdraw staked tokens and
     * corresponding rewards earned.
     * @param _id - Array index of the stake for `msg.sender`.
     */
    function unstake(uint256 _id) external;

    /**
     * @notice Function to claim rewards for a given stake.
     * @param _id - Array index of the stake for `msg.sender`.
     */
    function claimRewards(uint256 _id) external;
}