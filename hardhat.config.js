require("@nomiclabs/hardhat-ethers"); // yarn add --save-dev  @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers
require("@nomiclabs/hardhat-waffle"); // yarn add hardhat
require("@nomiclabs/hardhat-etherscan"); // yarn add @nomiclabs/hardhat-etherscan
require('dotenv').config(); // yarn add dotenv

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// yarn hardhat --network xdai deploy
task("deploy", "Deploy the contract", async (taskArgs, hre) => {
  // If this script is run directly using `node` you may want to call compile manually to make sure everything is compiled
  await hre.run('compile');
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  console.log('await hre.ethers.getContractFactory("Egg")');
  const Egg = await hre.ethers.getContractFactory("Egg");
  console.log('await Egg.deploy()');
  const egg = await Egg.deploy();
  console.log('await egg.deployed()');
  const contract = await egg.deployed();

  console.log("egg deployed to: ", egg.address);
  console.log("run the following command to verify:")
  console.log(`yarn hardhat --network ${hre.network.name} verify ${egg.address} "Your Constructor Argument 1"`)
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  solidity: {
    version: "0.8.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    xdai: {
      url: `https://rpc.gnosischain.com`,
      accounts: [`${process.env.GNOSIS_PRIVATE_KEY}`],
      chainId: 100,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      httpHeaders: undefined,
      timeout: 20000,
    },
    hardhat: {},
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API}`
  },
};
