// SPDX-License-Identifier: GPL
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {Upgrades, Options} from "openzeppelin-foundry-upgrades/Upgrades.sol";
import {Diamonds} from "src/Diamonds.sol";

contract DiamondsTest is Test {
  Diamonds public instance;

  function setUp() public {
    address initialOwner = vm.addr(1);
    Options memory opts;
    opts.unsafeAllow = "constructor";
    address proxy = Upgrades.deployTransparentProxy(
      "Diamonds.sol",
      initialOwner,
      abi.encodeCall(Diamonds.initialize, (initialOwner)),
      opts
    );
    instance = Diamonds(proxy);
  }

  function testName() public view {
    assertEq(instance.name(), "Diamonds");
  }
}
