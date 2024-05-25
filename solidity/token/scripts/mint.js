const hre = require("hardhat");

async function main() {
  const collateralTokenAddress = '0x52f74a8f9BdD29F77A5EFD7f6cb44DCF6906A4B6'; // D8 - WBTC
  const elTokenAddress = '0x0D6202a87B4e82623b07DC81cBb6B9C8adD09B8D';
  const ownerAddress = '0x687bE257D3590697Da95a264154c71062C701936';

  const CollateralToken = await hre.ethers.getContractAt("IERC20", collateralTokenAddress);
  const ELToken = await hre.ethers.getContractAt("ELToken", elTokenAddress);

  // Approve the ELToken contract to spend 1 WBTC-like token (WBTC has 8 decimals)
  console.log(`Approving ELToken (${elTokenAddress}) to spend 1 WBTC on behalf of ${ownerAddress}`);
  const approveTx = await CollateralToken.connect(await hre.ethers.getSigner(ownerAddress)).approve(elTokenAddress, 1_000_000_00);
  await approveTx.wait();

  // Now call mint on ELToken
  console.log(`Calling mint on ELToken (${elTokenAddress})`);
  const mintTx = await ELToken.connect(await hre.ethers.getSigner(ownerAddress)).mint(1_000_000_00, 1893456000);
  await mintTx.wait();

  console.log("Mint transaction completed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
