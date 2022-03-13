pragma solidity >=0.8.12 <0.9;

contract Ownable {
  address public owner;
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  // constructor, only execute once when contract first created
  constructor() {
    owner = msg.sender;
  }

  // create a new decorator to use to decorate other functions
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }
}