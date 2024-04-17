// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {StakingManager} from "./StakingManager.sol";
import {IStakingContract} from "./interfaces/IStakingContract.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "./Errors.sol";


/**
 * @title StakingContract
 * @notice This is the core contract for staking with fixed apy and lock multipliers.
 */
contract StakingContract is IStakingContract, StakingManager{

    struct Stake {
        uint256 amount; // amount staked.
        uint256 claimed; // timestamp of last claimed.
        uint256 stakedTill; // timestamp till when the token is staked.
        uint256 stakedAt; // timestamp at which the token is staked.
        uint256 rewardsCollected; // number of rewards collected.
    }

    uint256 public totalStaked = 0; // total amount staked inside the contract.

    IERC20 public immutable stakeToken; // address of the staking token address.
    IERC20 public immutable rewardToken; // address of the rewards token address.
    
    mapping(address => Stake[]) stakes; // array of stakes for each address.

    event Staked(address indexed _staker, uint256 _amount, uint256 _id); // emitted when tokens are staked.
    event Unstaked(address indexed _staker, uint256 _id); // emitted when tokens are unstaked.
    event Claimed(address indexed _staker, uint256 _amount, uint256 _id); // emitted when tokens are claimed.

    constructor(
        IERC20 _stakeToken,
        IERC20 _rewardToken,
        uint256 _maxLockingPeriod,
        uint256 _claimDelay,
        uint256 _lockMultiplier,
        uint256 _fixedApy
    )
        StakingManager(_maxLockingPeriod,_claimDelay,_lockMultiplier,_fixedApy)
    {
        stakeToken = _stakeToken;
        rewardToken = _rewardToken;
    }

    /**
     * @notice Function to lock tokens for a time period of `_duration`.
     * @param _amount - Amount of tokens to be staked.
     * @param _duration - Duration in seconds for the tokens to be locked/staked.
     */
    function stake(
        uint256 _amount,
        uint256 _duration
    )
        external
    {
        if(isStakingPaused) {
            revert StakingPaused();
        }

        if(_duration > MAX_LOCKING_PERIOD){
            revert InvalidLockingPeriod();
        }

        Stake memory _stake = Stake({
            amount: _amount,
            claimed: block.timestamp,
            stakedTill: block.timestamp + _duration,
            stakedAt: block.timestamp,
            rewardsCollected: 0
        });

        stakes[msg.sender].push(_stake);
        totalStaked += _amount;
        stakeToken.transferFrom(msg.sender, address(this), _amount);
        emit Staked(msg.sender, _amount, stakes[msg.sender].length - 1);
    }

    /**
     * @notice Function to be called to unstake tokens, which will withdraw staked tokens and
     * corresponding rewards earned.
     * @param _id - Array index of the stake for `msg.sender`.
     */
    function unstake(
        uint256 _id
    )
        external
    {
        if(isUnstakingPaused) {
            revert UnstakingPaused();
        }
        uint256 len = stakes[msg.sender].length;
        if(_id >= len) {
            revert InvalidStakeId(msg.sender, _id);
        }

        Stake memory _stake = stakes[msg.sender][_id];

        if(block.timestamp < _stake.stakedTill) {
            revert InvalidUnstakeTime(msg.sender, _id);
        }

        totalStaked -= _stake.amount;

        uint256 rewards = getRewards(msg.sender, _id);

        Stake[] storage _stakes = stakes[msg.sender];
        _stakes[_id] = _stakes[len - 1];
        _stakes.pop();

        stakeToken.transfer(msg.sender, _stake.amount);
        rewardToken.transfer(msg.sender, rewards);
        emit Unstaked(msg.sender, _id);
    }

    /**
     * @notice Function to claim rewards for a given stake.
     * @param _id - Array index of the stake for `msg.sender`.
     */
    function claimRewards(
        uint256 _id
    )
        external
    {
        Stake storage _stake = stakes[msg.sender][_id];

        if((_stake.claimed + CLAIM_DELAY) >= block.timestamp) {
            revert ClaimDelayNotExpired(msg.sender, _id);
        }

        uint256 rewards = getRewards(msg.sender, _id);

        _stake.claimed = block.timestamp;
        _stake.rewardsCollected += rewards;
        rewardToken.transfer(msg.sender, rewards);
        emit Claimed(msg.sender, rewards, _id);
    }

    /**
     * @notice Function to get stake details for `_id`.
     * @param _id - Array index of the stake for `_staker`.
     * @param _staker - Address of the staker.
     *
     * @return Stake details of `_id` of `_staker`.
     */
    function getStakeById(
        address _staker,
        uint256 _id
    )
        public
        view
        returns(Stake memory)
    {
        if(_id >= stakes[_staker].length){
            revert InvalidStakeId(_staker, _id);
        }
        return stakes[_staker][_id];
    }

    /**
     * @notice Function to get all the stakes for `_staker`.
     * @param _staker - Address of the staker.
     *
     * @return - Array of all stakes of `_staker`.
     */
    function getAllStakes(
        address _staker
    )
        external
        view
        returns(Stake[] memory)
    {
        return stakes[_staker];
    }

    /**
     * @notice Function to get rewards for a stake.
     * @param _staker - Address of the staker.
     * @param _id - Array index of the stake for `_staker`.
     *
     * @return - uint256 reward value.
     */
    function getRewards(
        address _staker,
        uint256 _id
    )
        public
        view
        returns(uint256)
    {
        if(_id >= stakes[_staker].length) {
            revert InvalidStakeId(_staker, _id);
        }
        Stake memory _stake = stakes[_staker][_id];
        uint256 timeElapsed = min(
            block.timestamp - _stake.stakedAt,
            _stake.stakedTill - _stake.stakedAt
        );
        uint256 percentage = (timeElapsed * FIXED_APY * LOCK_MULTIPLIER_PRECISION)/(FIXED_APY_PRECISION * 365 days);
        uint256 diff = (percentage * _stake.amount) / 100;
        uint256 multiplier = (timeElapsed * LOCK_MULTIPLIER)/(365 days);
        if(multiplier < LOCK_MULTIPLIER_PRECISION) {
            multiplier = LOCK_MULTIPLIER_PRECISION;
        }
        uint256 ans = (diff * multiplier)/(LOCK_MULTIPLIER_PRECISION * LOCK_MULTIPLIER_PRECISION);

        return ans - _stake.rewardsCollected;
    }

    /**
     * @notice Function to get minimum.
     * @param x - uint256 value.
     * @param y - uint256 value.
     *
     * @return minimum of `x` and `y`.
     */
    function min(uint256 x, uint256 y) internal pure returns(uint256) {
        return x <= y ? x : y;
    }
}