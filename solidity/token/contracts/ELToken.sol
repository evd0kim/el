// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract ELToken is ERC20, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public collateralToken; // ERC20 token used as collateral
    uint8 collateralDecimals; // shortcut
    //uint256 public reserveRate; // collateral asset multiplier

    struct CollateralPosition {
        uint256 lockUntil;
        uint256 initialLiquidity;
        //uint256 inboundLiquidity;
        //uint256 outboundLiquidity;
        //uint256 limit;
    }

    mapping (address => CollateralPosition) positions;
    /*
    modifier checkReserveRate(uint256 _reserveRate) {
        require(_reserveRate > 0, "reserveRate must be greater than zero");
        require(_reserveRate < 101, "reserveRate must be less than one hundred");
        _;
    }
    */
    modifier futureTimelock(uint256 _time) {
        // only requirement is the timelock time is after the last blocktime (now).
        // probably want something a bit further in the future then this.
        // but this is still a useful sanity check:
        require(_time > block.timestamp, "timelock time must be in the future");
        _;
    }

    constructor(address _collateralTokenAddress, uint8 _collateralDecimals, address initialOwner) ERC20("ELToken", "EBTC") Ownable(initialOwner) {
        require(_collateralTokenAddress != address(0), "Invalid token address");

        collateralToken = IERC20(_collateralTokenAddress);
        collateralDecimals = _collateralDecimals;
        //reserveRate = _reserveRate;
    }

    function mint(uint256 collateralTokenAmount, uint256 lockUntil) public {
        require(collateralTokenAmount > 0, "Amount must be greater than zero");
        collateralToken.safeTransferFrom(msg.sender, address(this), collateralTokenAmount);

        uint256 decimalsDifference;
        uint256 mintAmount;

        if (decimals() > collateralDecimals) {
            decimalsDifference = 10 ** (decimals() - collateralDecimals);
            mintAmount = collateralTokenAmount * decimalsDifference;
        } else if (decimals() < collateralDecimals) {
            decimalsDifference = 10 ** (collateralDecimals - decimals());
            mintAmount = collateralTokenAmount / decimalsDifference;
        } else {
            mintAmount = collateralTokenAmount;
        }

        // uint256 tokensToMint = collateralTokenAmount  * reserveRate;
        _mint(msg.sender, mintAmount);

        positions[msg.sender] = CollateralPosition(
            lockUntil,
            collateralTokenAmount
        );
    }

    function redeemCollateralTokens(uint256 amount) public {
        // check tokens returned into the contract
        require(balanceOf(msg.sender) >= amount, "Insufficient token balance");
        // check collat position
        if (havePosition(msg.sender))
            revert("No collateral position open");
        // check amount to be redeemed is less than collateral
        CollateralPosition storage p = positions[msg.sender];
        //uint256 requiredCollateral = tokenAmount / rate;
        require(p.initialLiquidity <= amount, "Insufficient collateral deposited");

        _burn(msg.sender, amount);
        collateralToken.safeTransfer(msg.sender, amount);
        p.initialLiquidity -= amount;
    }
    /*
    function withdrawCollateralTokens(uint256 amount) public onlyOwner {
        collateralToken.safeTransfer(owner(), amount);
    }
    function setReserveRate(uint256 newReserveRate) public onlyOwner checkReserveRate(newReserveRate) {
        require(newReserveRate > 0, "reserveRate must be greater than zero");
        reserveRate = newReserveRate;
    }
    */
    function havePosition(address owner)
    internal
    view
    returns (bool exists)
    {
        exists = (positions[owner].initialLiquidity > 0);
    }
}
