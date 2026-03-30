// SPDX-License-Identifier: GPLv3
pragma solidity ^0.8.20;

import { Script, console } from "forge-std/Script.sol";
import { stdJson } from "forge-std/StdJson.sol";

interface IERC721Mintable {
    function safeMint(address to, string calldata tokenURI) external returns (uint256);
}

contract BatchMint is Script {
  using stdJson for string;

  function run(
    address contract,
    address recipient,
    string calldata input
  ) external {
    if(recipient == address(0)) {
      recipient = msg.sender
    }
    string memory path   = string.concat(vm.projectRoot(), input);

    string memory raw = vm.readFile(path);
    string[] memory tokenURIs = raw.readStringArray("");

    console.log("Minting %d tokens to %s", tokenURIs.length, recipient);

    vm.startBroadcast();

    IERC721Mintable nft = IERC721Mintable(contract);

    for(uint256 i = 0; i < tokenURIs.length; i++) {
        uint256 tokenId = nft.safeMint(recipient, tokenURIs[i]);
        console.log("  Minted #%d: %s", tokenId, tokenURIs[i]);
    }

    vm.stopBroadcast();

    console.log("Done.");
  }
}