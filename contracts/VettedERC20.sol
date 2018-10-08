pragma solidity ^0.4.20;

contract VettedERC20 {
	address owner;
	modifier owned {
		if(owner!=address(0))
			require(msg.sender == owner);
		_;
	}

	function setOwner (address newOwner) owned public {
		owner = newOwner;
	}

	mapping (address => bool) vettedTokens;

	function addToken(address tokenAddress) owned public {
		vettedTokens[tokenAddress] = true;
	}

	function removeToken(address tokenAddress) owned public {
		vettedTokens[tokenAddress] = false;
	}

	function isTokenVetted(address tokenAddress) public view returns (bool) {
		return tokenAddress == address(0) || vettedTokens[tokenAddress];
	}
}