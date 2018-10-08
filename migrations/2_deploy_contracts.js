var Scarcity = artifacts.require("Scarcity");
var IBC = artifacts.require("InvertedBondingCurve");
var vetted = artifacts.require("VettedERC20");
var earlyBird = artifacts.require("earlyBird");
var lateComer = artifacts.require("lateComer");
//var safeMathLib = artifacts.require("SafeMath");

module.exports = function(deployer) {
  deployer.deploy(Scarcity);
  deployer.deploy(IBC);
  deployer.deploy(vetted);
  deployer.deploy(earlyBird);
  deployer.deploy(lateComer);
};
