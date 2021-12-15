# WavePortal 👋 

### **Welcome!**
To get started, clone this repo and follow these commands:

1. Run `npm install` at the root of your directory
2. Add the correct contract address (localhost, rinkeby etc) in `App.js`
3. Create a symlink to your WavePortal Hardhat project to make the contract dev abi file available:
```
ln -s /..absolutePathToHardhatProject../wavePortal/artifacts/contracts/WavePortal.sol/WavePortal.json ./src/utils/WavePortalDev.json
```
4. Run `npm run start` to start the project




