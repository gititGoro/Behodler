pragma solidity ^0.4.20;
import "../../node_modules/zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract earlyBird is StandardToken{

	function setBalance(uint value) public {
		balances[msg.sender] = value; 
	}
 
}
