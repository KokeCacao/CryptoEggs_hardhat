// SPDX-License-Identifier: GPL-3.0
import "./ownable.sol";

pragma solidity >=0.8.12 <0.9;

contract Egg is Ownable {

    event EggCreation(uint256 egg, address owner);

    uint256 nounce = 0;
  
    mapping (address => uint256) public ownerEggCount;
	  mapping (address => uint256) public ownerToEgg;
	  mapping (uint256 => address) public eggToOwner;
    
    constructor() {
    }

    function getEggOwner(uint256 eggNumber) external view returns (address) {
      return eggToOwner[eggNumber];
    }

    function getOwnerEgg(address addr) external view returns (uint256) {
      return ownerToEgg[addr];
    }

    function getOwnerEggCount(address addr) external view returns (uint256) {
      return ownerEggCount[addr];
    }

    function claimEgg() external {
      require(ownerEggCount[msg.sender] < 5); // You can only have maximum of 4 eggs.

      uint256 egg = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, nounce)));
      nounce = nounce+1;
      ownerToEgg[msg.sender] = egg;
      eggToOwner[egg] = msg.sender;
      ownerEggCount[msg.sender]++; // TODO: how is it initialized?

      emit EggCreation(egg, msg.sender);
    }
}
