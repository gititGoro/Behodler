var Scarcity = artifacts.require("Scarcity");
var IBC = artifacts.require("InvertedBondingCurve");

let async = require('./helpers/async.js');
let expectThrow = require("./helpers/expectThrow").handle;
let test = async.test;
let getBalance = async.getBalancePromise;

contract('Scarcity', function (accounts) {

	let scarcityInstance, IBCInstance = null;

	let initializer = async () => {
		scarcityInstance = await Scarcity.deployed();
		IBCInstance = await IBC.deployed();
		await scarcityInstance.setAuthority(accounts[0]);
		await scarcityInstance.setPrinter(IBCInstance.address, true, { from: accounts[0] });
		await IBCInstance.setOwner(accounts[0], { from: accounts[0] });
		await IBCInstance.setScarcityAddress(scarcityInstance.address);
	}

	before((done) => {
		initializer()
			.then(done)
			.catch(error => done(error));
	});

	test("calling scarcity issue from non IBC account should fail", async () => {
		expectThrow(scarcityInstance.issue(accounts[1], 100, { from: accounts[0] }));
	});

	test("calling scarcity burn from non IBC account should fail", async () => {
		expectThrow(scarcityInstance.burn(accounts[1], 100, { from: accounts[0] }));
	});
});
