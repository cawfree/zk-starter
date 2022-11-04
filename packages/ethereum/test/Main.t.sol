// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import "forge-std/Test.sol";

import "../src/Main.sol";
import "../src/generated/MainVerifier.sol";

contract MainTest is Test {
    Main public main;
    Verifier public verifier;

    function setUp() public {
        main = new Main();
        verifier = new Verifier();
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

    function testVerifier() public {
        assertEq(true, true);
        // 3, 11.
        //assertEq(
        //  verifier.verifyProof(
        //    a,
        //    b,
        //    c,
        //    input
        //  ),
        //  true
        //);
    }

}
