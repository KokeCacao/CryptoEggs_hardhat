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
  it('should allow someone to claim an egg for the first person', async () => {
    const result = await egg.connect(alice).claimEgg();
    expect(result.confirmations).to.equal(1);
    const waited = result.wait(); // wait to be mined

    const eggInt = await egg.ownerToCryptomons(alice.address, 0); // 0th egg should be the one we are getting
    // console.log(eggInt);
    expect(result).to.emit(egg, "EggCreation").withArgs(eggInt, alice.address);

    const eggCount = await contract.ownerCryptomonCount(alice.address);
    expect(eggCount).to.equal(1);
  });
  it('should allow someone to claim two eggs for the first person', async () => {
    const result = await egg.connect(alice).claimEgg();
    expect(result.confirmations).to.equal(1);
    const waited = result.wait(); // wait to be mined

    const result2 = await egg.connect(alice).claimEgg();
    expect(result.confirmations).to.equal(1);
    const waited2 = result.wait(); // wait to be mined

    const eggInt = await egg.ownerToCryptomons(alice.address, 0); // 1th egg should be the one we are getting
    const eggInt2 = await egg.ownerToCryptomons(alice.address, 1); // 1th egg should be the one we are getting
    // console.log(eggInt);
    expect(result).to.emit(egg, "EggCreation").withArgs(eggInt, alice.address);
    expect(result2).to.emit(egg, "EggCreation").withArgs(eggInt2, alice.address);

    const eggCount = await contract.ownerCryptomonCount(alice.address);
    expect(eggCount).to.equal(2);
  });
  it('should allow someone to claim 5 eggs for the first person', async () => {
    expect((await egg.connect(alice).claimEgg()).confirmations).to.equal(1);
    expect((await egg.connect(alice).claimEgg()).confirmations).to.equal(1);
    expect((await egg.connect(alice).claimEgg()).confirmations).to.equal(1);
    expect((await egg.connect(alice).claimEgg()).confirmations).to.equal(1);
    expect((await egg.connect(alice).claimEgg()).confirmations).to.equal(1);
    const eggCount = await contract.ownerCryptomonCount(alice.address);
    expect(eggCount).to.equal(5);
  });
  it('should not allow someone to claim 6 eggs for the first person', async () => {
    expect((await egg.connect(alice).claimEgg()).confirmations).to.equal(1);
    expect((await egg.connect(alice).claimEgg()).confirmations).to.equal(1);
    expect((await egg.connect(alice).claimEgg()).confirmations).to.equal(1);
    expect((await egg.connect(alice).claimEgg()).confirmations).to.equal(1);
    expect((await egg.connect(alice).claimEgg()).confirmations).to.equal(1);
    await expect(egg.connect(alice).claimEgg()).to.be.revertedWith("Exceed number of eggs");
    const eggCount = await contract.getOwnerEggCount(alice.address);
    expect(eggCount).to.equal(5);
    const cryptomonCount = await contract.ownerCryptomonCount(alice.address);
    expect(cryptomonCount).to.equal(5);
  });
  it('should allow someone to claim 5 eggs and wait for them to grow up', async () => {
    expect((await egg.connect(alice).claimEgg()).confirmations).to.equal(1);
    expect((await egg.connect(alice).claimEgg()).confirmations).to.equal(1);
    expect((await egg.connect(alice).claimEgg()).confirmations).to.equal(1);
    expect((await egg.connect(alice).claimEgg()).confirmations).to.equal(1);
    expect((await egg.connect(alice).claimEgg()).confirmations).to.equal(1);

    // increase 2 days
    await network.provider.send("evm_increaseTime", [parseInt(await contract.HATCH_TIME()) + 1]);
    await network.provider.send("evm_mine");

    expect((await egg.connect(alice).claimEgg()).confirmations).to.equal(1);
    expect((await egg.connect(alice).claimEgg()).confirmations).to.equal(1);
    const eggCount = await contract.getOwnerEggCount(alice.address);
    expect(eggCount).to.equal(2);
    const cryptomonCount = await contract.ownerCryptomonCount(alice.address);
    expect(cryptomonCount).to.equal(7);
  });
  it('should allow someone to kill an egg for the first person', async () => {
    const result = await egg.connect(alice).claimEgg();
    expect(result.confirmations).to.equal(1);
    const waited = result.wait(); // wait to be mined

    const eggInt = await egg.ownerToCryptomons(alice.address, 0);

    // kill egg
    expect((await egg.connect(alice).kill(eggInt)).confirmations).to.equal(1);

    // failure cases
    await expect(egg.connect(alice).kill(eggInt)).to.be.revertedWith("Already dead");
    await expect(egg.connect(owner).kill(eggInt)).to.be.revertedWith("No permission");
  });
  it('should allow someone to freeze an egg for the first person', async () => {
    const result = await egg.connect(alice).claimEgg();
    expect(result.confirmations).to.equal(1);
    const waited = result.wait(); // wait to be mined

    const eggInt = await egg.ownerToCryptomons(alice.address, 0);

    // freeze egg
    expect((await egg.connect(alice).freeze(eggInt)).confirmations).to.equal(1);

    // failure cases
    await expect(egg.connect(alice).freeze(eggInt)).to.be.revertedWith("Already frozen");
    await expect(egg.connect(owner).freeze(eggInt)).to.be.revertedWith("No permission");
  });
  it('should allow someone to claim two eggs and reproduce', async () => {
    const result = await egg.connect(alice).claimEgg();
    expect(result.confirmations).to.equal(1);
    const waited = result.wait(); // wait to be mined

    const result2 = await egg.connect(alice).claimEgg();
    expect(result.confirmations).to.equal(1);
    const waited2 = result.wait(); // wait to be mined

    // increase 2 days
    await network.provider.send("evm_increaseTime", [parseInt(await contract.HATCH_TIME()) + 1]);
    await network.provider.send("evm_mine");

    expect(await contract.ownerCryptomonCount(alice.address)).to.equal(2);

    const father = await contract.ownerToCryptomons(alice.address, 0);
    const fatherAdult = await contract.isAdult(father);
    expect(fatherAdult).to.equal(true);
    const mother = await contract.ownerToCryptomons(alice.address, 1);
    const motherAdult = await contract.isAdult(mother);
    expect(motherAdult).to.equal(true);

    expect((await egg.connect(alice).reproduce(father, mother)).confirmations).to.equal(1);
    expect(await contract.ownerCryptomonCount(alice.address)).to.equal(3);
    expect(await contract.getOwnerEggCount(alice.address)).to.equal(1);

    const child = await contract.ownerToCryptomons(alice.address, 2);
    const childAdult = await contract.isAdult(child);
    expect(childAdult).to.equal(false);
  });
  it('should not allow someone to reproduce when cooldown and test egg count', async () => {
    const result = await egg.connect(alice).claimEgg();
    expect(result.confirmations).to.equal(1);
    const result2 = await egg.connect(alice).claimEgg();
    expect(result.confirmations).to.equal(1);

    // increase 2 days
    await network.provider.send("evm_increaseTime", [parseInt(await contract.HATCH_TIME()) + 1]);
    await network.provider.send("evm_mine");

    const father = await contract.ownerToCryptomons(alice.address, 0);
    const mother = await contract.ownerToCryptomons(alice.address, 1);

    expect(await contract.getOwnerEggCount(alice.address)).to.equal(0);
    expect((await egg.connect(alice).reproduce(father, mother)).confirmations).to.equal(1);
    expect(await contract.getOwnerEggCount(alice.address)).to.equal(1);

    await expect(egg.connect(alice).reproduce(father, mother)).to.be.revertedWith("Father cooldown");

    await network.provider.send("evm_increaseTime", [parseInt(await contract.REPRODUCE_COOLDOWN()) + 1]);
    await network.provider.send("evm_mine");

    expect(await contract.getOwnerEggCount(alice.address)).to.equal(1);
    expect((await egg.connect(alice).reproduce(father, mother)).confirmations).to.equal(1);
    expect(await contract.getOwnerEggCount(alice.address)).to.equal(2);

    await network.provider.send("evm_increaseTime", [parseInt(await contract.HATCH_TIME()) - parseInt(await contract.REPRODUCE_COOLDOWN())]);
    await network.provider.send("evm_mine");
    expect(await contract.getOwnerEggCount(alice.address)).to.equal(1);

    await network.provider.send("evm_increaseTime", [parseInt(await contract.HATCH_TIME()) + 1]);
    await network.provider.send("evm_mine");
    expect(await contract.getOwnerEggCount(alice.address)).to.equal(0);
  });
});
