# CryptoEggs Hardhat

## Running
`yarn`
`yarn hardhat compile`
`yarn hardhat test`
`yarn hardhat node --hostname 0.0.0.0` (in shell #1 if on server)
`yarn hardhat node --hostname 127.0.0.1` (in shell #1 if on debug)
`yarn hardhat run scripts/deploy.js --network localhost` (in shell #2)

Before deploy, you need
```
yarn add --save-dev  @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers
yarn add @nomiclabs/hardhat-etherscan
yarn add dotenv
yarn hardhat --network xdai deploy
```

## Creation
Created using: @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-ethers ethers
- `yarn init -y`
- `yarn add hardhat`
- `yarn hardhat`

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
yarn hardhat accounts
yarn hardhat compile
yarn hardhat clean
yarn hardhat test
yarn hardhat node
node scripts/sample-script.js
yarn hardhat help
```
