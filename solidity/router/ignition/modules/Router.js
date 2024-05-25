const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("RouterModule", (m) => {

  const htlc = m.contract("Router", [], {});

  return { htlc };
});
