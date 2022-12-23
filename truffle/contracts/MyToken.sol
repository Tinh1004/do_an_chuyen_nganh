// SPDX-License-Identifier: MIT
pragma solidity >=0.6.1 <0.9.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("My CAPPU tokens", "CAPPU") {
        _mint(msg.sender, 5000 * 10**18);
    }
}
