// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "./Crowdsale.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/security/Pausable.sol";
import "./KycContract.sol";
import "./MyToken.sol";

contract MyTokenSale is Crowdsale, Ownable, Pausable {
    KycContract kyc;

    constructor(
        uint256 rate,
        address payable wallet,
        IERC20 token,
        KycContract _kyc
    ) Crowdsale(rate, wallet, token) {
        kyc = _kyc;
    }

    function _preValidatePurchase(address beneficiary, uint256 weiAmount)
        internal
        view
        override
    {
        super._preValidatePurchase(beneficiary, weiAmount);
        require(
            kyc.kycCompleted(msg.sender),
            "KYC not completed, purchase not allowed"
        );
    }
}
