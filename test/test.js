const { expect } = require("chai");
const { ethers } = require("hardhat");

// See: https://github.com/fvictorio/hardhat-examples
describe("Egg", function () {
  let Egg;
  let egg;
  let contract;
  let owner, alice;

  beforeEach(async () => { // hook that execute in front of every [it]
    Egg = await ethers.getContractFactory("Egg");
    egg = await Egg.deploy();
    contract = await egg.deployed();
    [owner, alice] = await ethers.getSigners();
  });
  it("should test deployment", async function () {
    expect(true).to.equal(true);
  });
  it('should check nobody has egg before', async () => {
    const result = await egg.connect(owner).getEggOwner(0);
    expect(result).to.equal('0x0000000000000000000000000000000000000000');
  });
  it('should allow someone to claim an egg for the first person', async () => {
    const result = await egg.connect(alice).claimEgg();
    expect(result.confirmations).to.equal(1);
    const waited = result.wait(); // wait to be mined

    const eggInt = await egg.getOwnerEgg(alice.address);
    expect(result).to.emit(egg, "EggCreation").withArgs(eggInt, alice.address);

    const eggCount = await contract.getOwnerEggCount(alice.address);
    expect(eggCount).to.equal(1);
  });
});
