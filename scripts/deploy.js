const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploying Kresus Module
  console.log("Deploying Kresus Module contract with the account:", deployer.address);
  const KresusModule = await hre.ethers.getContractFactory("KresusModule", deployer);
  const kresusModuleInstance = await KresusModule.deploy(
    "0xbac8780B99aE84656989Be9C6a0B1470417A6dC4",
    "0xEeCe51f53dda9881Ae2B5EDB752Ad22c8C7Aebd7",
    "0x7Bf09A75DA7e88977150f452135Ead9c90729cbd"
  );
  console.log("Deployed Address of Kresus Module instance: ", kresusModuleInstance.address);

  // deploying Base Vault
  // console.log("Deploying Base Vault with the account:", deployer.address);
  // const BaseVault = await hre.ethers.getContractFactory("BaseVault", deployer);
  // const baseVaultInstance = await BaseVault.deploy();
  // console.log("Deployed Address of Base Vault instance: ", baseVaultInstance.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
