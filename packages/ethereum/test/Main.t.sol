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
            uint256(0x0a7774c5810dfab4355ba2a2a3470ab697b4c53045ed76a2ebe9615a000ae11d),
            uint256(0x1205d94c66f9243152214ba7ec56e9fa6361acd48585c0c86455cf88ea1a9d03)
          ],
          [
            [
              uint256(0x0b98bba3e11dc812a03e790dfd1cda8f50382dba0bb0a88a747e1b64ba94f6c5),
              uint256(0x2d730fa341572836a1651d889bc670b525221eebc1e22bb0a30eadde83824aba)
            ],
            [
              uint256(0x1c61e5df58ebd12173fa73bdbd0e07236b45f51f6e139898a5d3eeccab9c5d7b),
              uint256(0x154d701105fa01a0a596f85d0c1ff48a104bc4030e0c9d5581ebdb8f7cafd775)
            ]
          ],
          [
            uint256(0x161e2209caaadda4747ed0b97f810facb2efbcadef333f9170515a11f7753902),
            uint256(0x1ab07345f3f9302afd31617006598ffbb9fcfee9782f6f403590e8bec8888050)
          ],
          [
            uint256(0x0000000000000000000000000000000000000000000000000000000000000021),
            uint256(0x0000000000000000000000000000000000000000000000000000000000000003)
          ]
        );
        assertEq(result, true);
    }


}
