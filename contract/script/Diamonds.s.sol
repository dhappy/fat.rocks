// SPDX-License-Identifier: GPL
pragma solidity ^0.8.27;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {Upgrades, Options} from "openzeppelin-foundry-upgrades/Upgrades.sol";
import {Diamonds} from "src/Diamonds.sol";

contract DiamondsScript is Script {
  function setUp() public {}

  function run() public {
    vm.startBroadcast();
    address initialOwner = 0x681b7E45361583fa16BC94Fd3A98003156592096;
    Options memory opts;
    opts.unsafeAllow = "constructor";
    address proxy = Upgrades.deployTransparentProxy(
      "Diamonds.sol",
      initialOwner,
      abi.encodeCall(Diamonds.initialize, (initialOwner)),
      opts
    );
    Diamonds instance = Diamonds(proxy);
    console.log("Proxy deployed to %s", address(instance));
    vm.stopBroadcast();
  }
}
