pragma solidity ^0.4.20;
import "../node_modules/zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";


contract Scarcity is StandardToken{

	mapping(address => bool) printers;
	address authority;
	uint supply;
	modifier restricted {
		require(printers[msg.sender]==true);
		_;
	}

	modifier authorized {
		require(msg.sender == authority);
		_;
	}

	function totalSupply() public view returns (uint256) {
		return supply;
	}

	function transfer(address _to, uint256 _value) public returns (bool) {
		if(_to == address(0))
			return burn(msg.sender,_value);
		else
			return super.transfer(_to,_value);
	}

	function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
		if(_to == address(0))
			return burn(_from,_value);
		else
			return super.transferFrom(_from,_to,_value);
	}

	//modifier only IBC can call these
	function issue(address to, uint value) restricted public returns (bool) {
		balances[to] = balances[to].add(value);
		supply = supply.add(value);
		return true;
	}

	function burn (address from, uint value) restricted public returns (bool) {
		require(balances[from] >= value);
		balances[from] = balances[from].sub(value);
		supply = supply.sub(value);
		return true;
	}

	function setPrinter (address printer, bool value) authorized public {
		printers[printer] = value;
	}

	function setAuthority (address auth) public {
		if(authority != address(0)){
			require (msg.sender == authority);
		}
		authority = auth;
	}
}