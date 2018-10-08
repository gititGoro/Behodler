let Scarcity = artifacts.require("Scarcity");
let IBC = artifacts.require("InvertedBondingCurve");
let earlyBird = artifacts.require("earlyBird");
let lateComer = artifacts.require("lateComer");
let vetter = artifacts.require("VettedERC20");
let bigNumber = require("bignumber.js");

let async = require('./helpers/async.js');
let expectThrow = require("./helpers/expectThrow").handle;
let test = async.test;
let getBalance = async.getBalancePromise;

contract('IBC', function (accounts) {

	let scarcityInstance, IBCInstance, lateComerInstance, earlyBirdInstance, vetterInstance = null;

	let initializer = async () => {
		scarcityInstance = await Scarcity.deployed();
		IBCInstance = await IBC.deployed();
		earlyBirdInstance = await earlyBird.deployed();
		lateComerInstance = await lateComer.deployed();
		vetterInstance = await vetter.deployed();

		await vetterInstance.setOwner(accounts[0], { from: accounts[0] });
		await scarcityInstance.setAuthority(accounts[0]);
		await scarcityInstance.setPrinter(IBCInstance.address, true, { from: accounts[0] });
		await IBCInstance.setOwner(accounts[0], { from: accounts[0] });
		await IBCInstance.setScarcityAddress(scarcityInstance.address);
		await IBCInstance.setTokenAuthenticator(vetterInstance.address, { from: accounts[0] });
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

	test("buying scarcity with unvetted token fails", async () => {
		await vetterInstance.addToken(earlyBirdInstance.address, { from: accounts[0] });
		await earlyBirdInstance.approve(IBCInstance.address, 100, { from: accounts[0] });
		await earlyBirdInstance.setBalance(100);
		await IBCInstance.buyScarcityWithToken(earlyBirdInstance.address, 20, { from: accounts[0] });
		vetterInstance.removeToken(earlyBirdInstance.address, { from: accounts[0] });
		expectThrow(IBCInstance.buyScarcityWithToken(earlyBirdInstance.address, 20, { from: accounts[0] }));
	});


	test("buy and then sell scarcity with earlybird token", async () => {
		let tokenfactor = new bigNumber(10).pow(18);
		let tokensSpent = tokenfactor.mul(90);

		await vetterInstance.addToken(earlyBirdInstance.address, { from: accounts[0] });
		for (let i = 0; i < accounts.length; i++) {
			await earlyBirdInstance.setBalance(tokenfactor.mul(100), { from: accounts[i] });
		}
		let startingScarcity = await scarcityInstance.balanceOf(accounts[0]);
		console.log("initial scarcity balance: " + startingScarcity);

		let balances = getBalancesForMassBuy();
		let totalSpent = new bigNumber(0);

		let expectedTotalScarcity = new bigNumber(0);
		let actualBalances = [];
		for (let i = 0; i < 25; i++) {
			await earlyBirdInstance.approve(IBCInstance.address, tokenfactor.mul(100), { from: accounts[i] });
			let scarcityBefore = await scarcityInstance.balanceOf.call(accounts[i]);
			let result = await IBCInstance.buyScarcityWithToken(earlyBirdInstance.address, tokensSpent, { from: accounts[i] });
			let scarcityAfter = (await scarcityInstance.balanceOf.call(accounts[i]));
			let scarcityBought = scarcityAfter.minus(scarcityBefore);
			actualBalances.push(scarcityBought.toString());
			assert.equal(scarcityBought.toString().substring(0, 10), balances[i].substring(0, 10));
			expectedTotalScarcity = expectedTotalScarcity.add(scarcityBought);
			let totalScarcity = await scarcityInstance.totalSupply.call({ from: accounts[0] });
			let totalScarcityExcludingInitial = totalScarcity.minus(startingScarcity);
			assert.equal(expectedTotalScarcity.toString(), totalScarcityExcludingInitial.toString());
		}

		let balanceBeforeWithdrawal = await earlyBirdInstance.balanceOf(accounts[0]);
		await IBCInstance.withdrawSurplus(earlyBirdInstance.address, { from: accounts[0] });
		let balanceAfterWithdrawal = await earlyBirdInstance.balanceOf(accounts[0]);
		let profit = balanceAfterWithdrawal.minus(balanceBeforeWithdrawal);

		let feeRatio = profit.div(tokensSpent.mul(25));
		assert.equal(feeRatio.toString().substring(0, 4), "0.20");

		//SELL
		let accumulatedCost = new bigNumber(0);
		for (let i = balances.length - 1; i >= 0; i--) {
			let tokenBalanceBeforeWithdrawal = await earlyBirdInstance.balanceOf(accounts[i]);
			let scarcityBalance = await scarcityInstance.balanceOf(accounts[i]);
			await scarcityInstance.approve(IBCInstance.address, scarcityBalance, { from: accounts[i] });

			let result = await IBCInstance.sellScarcityForTokens(earlyBirdInstance.address, balances[i], { from: accounts[i] });
			let tokenBalanceAfterWithdrawal = await earlyBirdInstance.balanceOf(accounts[i]);

			let tokenDifference = i == 0 ? new bigNumber("18.016366") : tokenfactor.mul(100).minus(tokenBalanceAfterWithdrawal);

			accumulatedCost = accumulatedCost.add(tokenDifference);
			let actualBalance = parseFloat(tokenBalanceAfterWithdrawal.div(tokenfactor).toString().substring(0, 532));
			if (i == 0) {
				assert.isAtLeast(actualBalance, 530);
				assert.isAtMost(actualBalance, 532);
			}
			else {
				assert.isAtLeast(actualBalance, 81.99);
				assert.isAtMost(actualBalance, 82);
			}
		}
		console.log(`profit ${profit.div(tokenfactor).toString()}, fees ${accumulatedCost.div(tokenfactor).toString()}`);

		balanceBeforeWithdrawal = await earlyBirdInstance.balanceOf(accounts[0]);

		await IBCInstance.withdrawSurplus(earlyBirdInstance.address, { from: accounts[0] });
		balanceAfterWithdrawal = await earlyBirdInstance.balanceOf(accounts[0]);
		profit = balanceAfterWithdrawal.minus(balanceBeforeWithdrawal);
		assert.isAtMost(parseFloat(profit.div(tokenfactor).toString()), 0.000001);

		await IBCInstance.withdrawSurplus(earlyBirdInstance.address, { from: accounts[0] });
		let anotherWithdrawal = await earlyBirdInstance.balanceOf(accounts[0]);
		console.log(`before ${balanceBeforeWithdrawal.toString()}, after ${balanceAfterWithdrawal.toString()} and final ${anotherWithdrawal.toString()}`);
	});

	test("buy and then sell scarcity with ether", async () => {
		let etherfactor = new bigNumber(10).pow(18);
		let etherSpent = etherfactor.mul(90);

		let balances = getBalancesForMassBuy();

		let expectedTotalScarcity = new bigNumber(0);
		for (let i = 0; i < balances.length; i++) {
			await IBCInstance.buyScarcityWithEther({ from: accounts[i], value: etherSpent });
			let scarcityBought = (await scarcityInstance.balanceOf.call(accounts[i]));
			assert.equal(scarcityBought.toString().substring(0, 7), balances[i].substring(0, 7));
			expectedTotalScarcity = expectedTotalScarcity.add(scarcityBought);
			let totalScarcity = await scarcityInstance.totalSupply.call({ from: accounts[0] });
			assert.equal(expectedTotalScarcity.toString(), totalScarcity.toString());
		}
		let balanceBeforeWithdrawal = await getBalance(accounts[0]);
		await IBCInstance.withdrawSurplus(0, { from: accounts[0] });
		let balanceAfterWithdrawal = await getBalance(accounts[0]);
		let profit = balanceAfterWithdrawal.minus(balanceBeforeWithdrawal);

		let feeRatio = profit.div(etherSpent.mul(25));
		assert.equal(feeRatio.toString().substring(0, 4), "0.19");

		//SELL
		let accumulatedCost = new bigNumber(0);
		for (let i = balances.length - 1; i >= 0; i--) {
			let etherBalanceBeforeWithdrawal = await getBalance(accounts[i]);
			await scarcityInstance.approve(IBCInstance.address, balances[i], { from: accounts[i] });
			await IBCInstance.sellScarcityForEther(balances[i], { from: accounts[i] });
			let etherBalanceAfterWithdrawal = await getBalance(accounts[i]);

			let etherDifference = i == 0 ? new bigNumber("18.016366") : etherfactor.mul(100).minus(etherBalanceAfterWithdrawal);

			accumulatedCost = accumulatedCost.add(etherDifference);
			let expectedEther = parseFloat(etherBalanceAfterWithdrawal.div(etherfactor).toString().substring(0, 7));
			if (i == 0) {
				assert.isAtLeast(expectedEther, 530);
				assert.isAtMost(expectedEther, 532);
			}
			else {
				assert.isAtLeast(expectedEther, 81);
				assert.isAtMost(expectedEther, 82);
			}
		}
		console.log(`profit ${profit.div(etherfactor).toString()}, fees ${accumulatedCost.div(etherfactor).toString()}`);

		balanceBeforeWithdrawal = await getBalance(accounts[0]);
		await IBCInstance.withdrawSurplus(0, { from: accounts[0] });
		balanceAfterWithdrawal = await getBalance(accounts[0]);
		profit = balanceBeforeWithdrawal.minus(balanceAfterWithdrawal);
		assert.equal(profit.div(etherfactor).toString().substring(0, 3), "0.0");
		console.log("remaining profit after sales: " + profit.toString());
	});
});

function getBalancesForMassBuy() {
	return JSON.parse(`[
		"40745637374676095588",
		"16877395616082990303",
		"12950481143018270692",
		"10917760634782512254",
		"9618740211513944267",
		"8696005860199516153",
		"7996802695549394317",
		"7443242464903125870",
		"6990846161717792642",
		"6612106698348680241",
		"6288972199386910130",
		"6009037226583158370",
		"5763456569140786844",
		"5545730258526891132",
		"5350959923480282782",
		"5175374518417063750",
		"5016017182564405879",
		"4870532271800791783",
		"4737016760191051731",
		"4613914208471639142",
		"4499937598132612337",
		"4394012179627708444",
		"4295232474734021883",
		"4202829467904689642",
		"4116145250456852410"
	]`);
}