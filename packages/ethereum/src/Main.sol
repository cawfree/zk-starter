// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.11;

import "../../../build/contracts/MainVerifier.sol";

contract Main {
    uint256 public number;

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }
}
