// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './YourContract.sol';

contract YourContractFactory {
  address[] yourContracts;

  // not all of the fields are necessary, but they sure are useful
  event CreateYourContract(uint256 indexed contractId, address indexed contractAddress, address creator, string name, uint256 timestamp);

  constructor() {}

  /**
        @param name for better frontend UX
        @param purpose the purpose
     */
  function createYourContract(string memory name, string memory purpose) public {
    uint256 id = yourContracts.length;
    YourContract yc = new YourContract(purpose);
    yourContracts.push(address(yc));

    // technically, the factory created the contract and became the owner
    // you probably don't want it to remain the owner => transfer ownership
    yc.transferOwnership(msg.sender);

    emit CreateYourContract(id, address(yc), msg.sender, name, block.timestamp);
  }

  function numberOfContracts() public view returns (uint256) {
    return yourContracts.length;
  }

  function contractById(uint256 id) public view returns (address) {
    return yourContracts[id];
  }
}
