// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import "forge-std/Test.sol";

import "../src/Main.sol";

contract MainTest is Test {
  Main public main;

  function setUp() public {
    main = new Main();
  }
  
  function testTestsAreInvokedForMain() public {
    assertEq(true, true);
  }

}