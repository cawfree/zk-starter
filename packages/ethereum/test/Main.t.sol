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

    function testVerifyProof() public {
        bool result = main.verifyProof(
          [
            uint256(0x215a0ebfd92aefc100ff2e02e8257fa66eda37c4dd511e51c26fc703e0d02d10),
            uint256(0x0239e56d25c6188c7b6b6be94837c78f73516731bfdfc5cd414679e710065d4a)
          ],
          [
            [
              uint256(0x052fd1d60798b8ad311a743fc56b896fbee3f3128f680cf4118379bdb6717b70),
              uint256(0x0bb2582309e23e9381d29046021543406917491ec7d8a07b25fc53c42ec9a6ca)
            ],
            [
              uint256(0x1b9c47c8e01d2a942d61e471f9ce2977640ff2720760ded1e01d888f1f2a63e3),
              uint256(0x69693c859ddf28c50148380c55cb41e39c2bbc83fb81d40e662e9e58aa7b31)
            ]
          ],
          [
            uint256(0x08a4a6278880d96d72ccbf1973181559318bec5b8aab3f522dde3829e5564683),
            uint256(0x0824542e317aba16cfaaeb2247725e90fdca0ba7ac6647b75e41b8a4d9dab23b)
          ],
          [
            uint256(0x21),
            uint256(0x03)
          ]
        );
        assertEq(result, true);
    }


}
