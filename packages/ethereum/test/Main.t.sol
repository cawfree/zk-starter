// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import "forge-std/Test.sol";
import "../src/Main.sol";

contract MainTest is Test {
    Main public main;

    function setUp() public {
        main = new Main();
        main.setNumber(0);
    }

    function testIncrement() public {
        main.increment();
        assertEq(main.number(), 1);
    }

    function testSetNumber(uint256 x) public {
        main.setNumber(x);
        assertEq(main.number(), x);
    }
}
