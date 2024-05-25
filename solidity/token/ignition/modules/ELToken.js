const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const INITIAL_OWNER = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";

const INITIAL_SUPPLY = "1000000000000000000000";
const RECIPIENT_ADDRESS = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";

const VBTCModule =  buildModule("VBTCDeploymentModule", (m) => {
  const initialSupply = m.getParameter("Initial Supply of Tokens", INITIAL_SUPPLY);
  const vbtc = m.contract("VBTC", [initialSupply]);
  m.call(vbtc, "transfer", [RECIPIENT_ADDRESS, INITIAL_SUPPLY]);
  return {
    vbtc,
  };
});

module.exports = buildModule("ELTokenModule", (m) => {
  const { cToken } = m.useModule(VBTCModule);
  const owner = m.getParameter("initialOwner", INITIAL_OWNER);

  const eltoken = m.contract("ELToken", [cToken, owner], {});

  return { eltoken };
});
