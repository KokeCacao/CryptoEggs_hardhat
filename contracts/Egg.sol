// SPDX-License-Identifier: GPL-3.0
import "./ownable.sol";

pragma solidity >=0.8.12 <0.9;

contract Egg is Ownable {
    // uint256 public constant REPRODUCE_COOLDOWN = 60 * 60 * 24;
    uint256 public constant REPRODUCE_COOLDOWN = 60;
    uint256 public constant HATCH_TIME = REPRODUCE_COOLDOWN * 2;
    uint256 public constant ABILITY_COOLDOWN = 60 * 60 * 24;
    uint256 public constant MAX_EGGS = 5;

    event EggCreation(uint256 egg, address owner);

    uint256 nounce = 0;
  
    mapping (address => uint256) public ownerCryptomonCount;
	  mapping (address => uint256[]) public ownerToCryptomons;
    mapping (address => uint256) private ownerEggCount;
	  mapping (address => uint256[]) public ownerToEggs;
    mapping (uint256 => EggInstance) public eggToEggInstance;
    struct EggInstance{
      bool alive;
      uint256 frozenTime;
      uint256 id;
      uint256 father;
      uint256 mother;
      address owner;
      uint256 ownerNonce;
      uint256 timestamp; // time stamp egg born, determine egg or cryptomon
      uint256 hatchTime;
      uint256 abilityCooldown; // last time activated
      uint256 reproductionCooldown;
      string name;
      uint256[] children;
    }
    
    constructor() {
    }

    // since [ownerEggCount] is inaccurate at view time,
    // to get the true egg count involves time calculation
    // let it be external view to avoid fee
    function getOwnerEggCount(address owner) external view returns (uint256) {
      uint256[] memory eggs = ownerToEggs[owner];
      uint256 tmpCount = 0;
      for (uint i = 0; i < eggs.length; i++) {
        if (!isAdult(eggs[i])) {
          tmpCount++;
        }
      }
      return tmpCount;
    }

    function hasInventory(address owner) internal returns (bool) {
      /* Uncomment below 3 lines to enable lazy update.
       * ownerEggCount might not be accurate if enabled even at run time (rare cases).
       * use it with caution!
       */
      if (ownerEggCount[owner] < MAX_EGGS) return true;
      require(ownerEggCount[owner] == MAX_EGGS, "Internal Error");
      uint256[] memory eggs = ownerToEggs[owner];
      require(eggs.length == MAX_EGGS, "Internal Error");

      uint256 tmpCount = 0;
      bool[] memory tmp = new bool[](eggs.length);
      for (uint i = 0; i < eggs.length; i++) {
        if (!isAdult(eggs[i])) {
          tmp[i] = true;
          tmpCount++;
        }
      }
      uint256 filteredCount = 0;
      uint256[] memory filtered = new uint256[](tmpCount);
      for (uint i = 0; i < eggs.length; i++) {
        if (tmp[i]) {
          filtered[filteredCount] = eggs[i];
          filteredCount++;
        }
      }

      ownerEggCount[owner] = tmpCount;
      ownerToEggs[owner] = filtered;

      return tmpCount < MAX_EGGS;
    }

    modifier callerHasInventory() {
        require(hasInventory(msg.sender), "Exceed number of eggs");
        _;
    }

    function isAdult(uint256 egg) public view returns (bool) {
      EggInstance memory eggInstance = eggToEggInstance[egg];
      if (eggInstance.frozenTime > 0) {
        return block.timestamp > eggInstance.frozenTime;
      }
      return block.timestamp > eggInstance.hatchTime;
    }

    function reproduce(uint256 father, uint256 mother) external callerHasInventory() {
      EggInstance memory fatherInstance = eggToEggInstance[father];
      EggInstance memory motherInstance = eggToEggInstance[mother];
      require(fatherInstance.owner == msg.sender, "No permission");
      require(fatherInstance.alive == true, "Father dead");
      require(fatherInstance.frozenTime == 0, "Father frozen");
      require(fatherInstance.reproductionCooldown < block.timestamp, "Father cooldown");
      require(isAdult(father), "Father is not adult");
      require(motherInstance.owner == msg.sender, "No permission");
      require(motherInstance.alive == true, "Mother dead");
      require(motherInstance.frozenTime == 0, "Mother frozen");
      require(motherInstance.reproductionCooldown < block.timestamp, "Mother cooldown");
      require(isAdult(mother), "Mother is not adult");

      uint256 egg = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, nounce, father, mother)));
      gotEgg(msg.sender, egg, father, mother);

      EggInstance storage fatherStorage = eggToEggInstance[father];
      fatherStorage.reproductionCooldown = block.timestamp + REPRODUCE_COOLDOWN;
      fatherStorage.children.push(egg);

      EggInstance storage motherStorage = eggToEggInstance[mother];
      motherStorage.reproductionCooldown = block.timestamp + REPRODUCE_COOLDOWN;
      motherStorage.children.push(egg);
    }

    // function abandon(uint256 egg) external {
    //   EggInstance memory eggInstance = eggToEggInstance[egg];
    //   require(eggInstance.owner == msg.sender, "No permission");
    //   require(eggInstance.alive == true, "Already dead");
    //   require(eggInstance.frozenTime == 0, "You cannot free frozen body");
    //   EggInstance storage validEggInstance = eggToEggInstance[egg];
    //   validEggInstance.owner = 0;
    //   // TODO: unfinished
    // }

    function kill(uint256 egg) external {
      EggInstance memory eggInstance = eggToEggInstance[egg];
      require(eggInstance.owner == msg.sender, "No permission");
      require(eggInstance.alive == true, "Already dead");
      require(eggInstance.frozenTime == 0, "You cannot kill frozen body");
      EggInstance storage validEggInstance = eggToEggInstance[egg];
      validEggInstance.alive = false;
    }

    function freeze(uint256 egg) external {
      EggInstance memory eggInstance = eggToEggInstance[egg];
      require(eggInstance.owner == msg.sender, "No permission");
      require(eggInstance.frozenTime == 0, "Already frozen");
      require(eggInstance.alive == true, "You cannot free dead body");
      EggInstance storage validEggInstance = eggToEggInstance[egg];
      validEggInstance.frozenTime = block.timestamp;
    }

    function gotEgg(address owner, uint256 egg, uint256 father, uint256 mother) internal callerHasInventory() {
      nounce = nounce+1;
      eggToEggInstance[egg] = EggInstance(
        true,
        0,
        egg,
        father,
        mother,
        owner,
        ownerCryptomonCount[owner],
        block.timestamp,
        block.timestamp + HATCH_TIME,
        block.timestamp,
        block.timestamp,
        "",
        new uint256[](0)
      );
      ownerToEggs[owner].push(egg);
      ownerEggCount[owner]++;
      ownerToCryptomons[owner].push(egg);
      ownerCryptomonCount[owner]++;

      emit EggCreation(egg, owner);
    }

    function claimEgg() external {
      uint256 egg = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, nounce)));
      gotEgg(msg.sender, egg, 0, 0);
    }
}
