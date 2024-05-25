const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const INITIAL_SUPPLY = "1000000000000000000000"; 
const RECIPIENT_ADDRESS = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";

module.exports = buildModule("VBTCDeploymentModule", (m) => {
  const initialSupply = m.getParameter("Initial Supply of Tokens", INITIAL_SUPPLY);
  const vbtc = m.contract("VBTC", [initialSupply]);


  m.call(vbtc, "transfer", [RECIPIENT_ADDRESS, INITIAL_SUPPLY]);
  console.log(`Transferred ${INITIAL_SUPPLY} tokens to ${RECIPIENT_ADDRESS}`);

  return {
    vbtc,
  };
});