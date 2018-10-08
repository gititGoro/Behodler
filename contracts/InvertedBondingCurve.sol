pragma solidity ^0.4.20;
import "../node_modules/zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "./Scarcity.sol";
import "./VettedERC20.sol";
import "./libraries/SafeOperations.sol";

contract InvertedBondingCurve { //Pt = 10S/2^64, Pt = 8S/2^64
	event PurchaseScarcity(address indexed tokenContract, uint tokenAmount, uint scarcityAmount, uint tokenBalance, uint scarcityObligations);
	event SellScarcity(address indexed tokenContract, uint tokenAmount, uint scarcityAmount, uint tokenBalance, uint scarcityObligations);
	
	address scarcityAddress;
	mapping (address=>uint) tokenScarcityObligations;
	address owner;
	address tokenValidator;
	uint constant factor = 64;
	using SafeOperations for uint;
	using SafeMath for uint;
	function setOwner (address newOwner) public {
		if(owner == address(0) || owner == msg.sender)
			owner = newOwner;
	} 

	function setTokenAuthenticator (address authenticator) public {
		if(tokenValidator == address(0) || owner == msg.sender)
			tokenValidator = authenticator;
	} 

	function setScarcityAddress(address scarcityToken) public {
		require(msg.sender == owner);
		scarcityAddress = scarcityToken;
	}

	function tokenFallBack() public pure {
		//TODO: implement ERC 223 tokenFallback
	}

	function() public {
		buyScarcityWithEther();
	}

	function buyScarcityWithTokenOrEther(address tokenContract, uint tokenAmount) private {
		require(VettedERC20(tokenValidator).isTokenVetted(tokenContract));
		uint currentTokens = tokenScarcityObligations[tokenContract].square().safeRightShift(factor);
		uint finalTokens = currentTokens.add(tokenAmount);
		uint finalScarcity = (finalTokens.safeLeftShift(factor)).sqrt();
		uint scarcityToPrint = finalScarcity.sub(tokenScarcityObligations[tokenContract]);
		require(scarcityToPrint > 0);

		//bookkeeping
		tokenScarcityObligations[tokenContract] = finalScarcity;
		//issue scarcity, take tokens
		Scarcity(scarcityAddress).issue(msg.sender, scarcityToPrint);
		if(tokenContract != address(0))
			ERC20(tokenContract).transferFrom(msg.sender,this,tokenAmount);

		emit PurchaseScarcity(tokenContract, tokenAmount, scarcityToPrint, finalTokens, finalScarcity);
	}

	function buyScarcityWithEther() public payable {
		require(msg.value > 0);
		buyScarcityWithTokenOrEther(address(0),msg.value);
	}

	function buyScarcityWithToken(address tokenContract, uint tokenAmount) public {
		require(tokenContract != address(0));
		buyScarcityWithTokenOrEther(tokenContract, tokenAmount);
	}

	function sellScarcityForTokenOrEther(address tokenContract, uint scarcity) private {
		require(VettedERC20(tokenValidator).isTokenVetted(tokenContract));
		require(scarcity <= tokenScarcityObligations[tokenContract]);
		uint scarcityAfter = tokenScarcityObligations[tokenContract].sub(scarcity);
		uint tokenObligations = tokenScarcityObligations[tokenContract].square().safeRightShift(factor);
		uint tokensAfter = scarcityAfter.square().safeRightShift(factor);

		uint tokensToSendToUser = (tokenObligations.sub(tokensAfter)).mul(4).div(5);//20% spread
		require(tokensToSendToUser > 0);
	
		tokenScarcityObligations[tokenContract] = scarcityAfter;

		Scarcity(scarcityAddress).burn(msg.sender,scarcity);
		if(tokenContract!=address(0))
			ERC20(tokenContract).transfer(msg.sender,tokensToSendToUser);
		else 
			msg.sender.transfer(tokensToSendToUser);
		
		emit SellScarcity(tokenContract, tokensToSendToUser, scarcity, tokensAfter, scarcityAfter);
	}

	function sellScarcityForTokens (address tokenContract, uint scarcity) public {
		require(tokenContract != address (0));
		sellScarcityForTokenOrEther(tokenContract, scarcity);
	}

	function sellScarcityForEther (uint scarcity) public {
		sellScarcityForTokenOrEther(address(0),scarcity);
	} 

	function withdrawSurplus(address tokenContract) public {
		require(msg.sender == owner);
		uint tokenSaleObligations = tokenScarcityObligations[tokenContract].square().safeRightShift(factor);
		uint tokenObligationsAfterSpread = tokenSaleObligations.mul(4).div(5);
		uint currentBalance = tokenContract == address(0)?address(this).balance:ERC20(tokenContract).balanceOf(this);
		uint surplus = currentBalance.sub(tokenObligationsAfterSpread);

		if(tokenContract != address(0))
			ERC20(tokenContract).transfer(owner,surplus);
		else
			msg.sender.transfer(surplus);
	}
}