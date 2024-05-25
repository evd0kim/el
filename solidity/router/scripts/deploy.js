const hre = require("hardhat");

async function main() {
  const htlc = await hre.ethers.deployContract("Router", [], {});

  await htlc.waitForDeployment();

  console.log(
    `Router deployed to ${htlc.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});