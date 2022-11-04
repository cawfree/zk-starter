// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import "./generated/MainVerifier.sol";

contract Main {
    uint256 public number;

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }
}
