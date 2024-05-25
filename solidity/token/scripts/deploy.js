const hre = require("hardhat");

async function main() {
  const collateralTokenAddress = '0x52f74a8f9BdD29F77A5EFD7f6cb44DCF6906A4B6'; // D8 - WBTC
  const ownerAddress = '0x687bE257D3590697Da95a264154c71062C701936';

  const ELToken = await hre.ethers.getContractFactory("ELToken");
  const elToken = await ELToken.deploy(collateralTokenAddress, ownerAddress);
  await elToken.waitForDeployment();

  console.log(
      `ELToken deployed to ${elToken.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
