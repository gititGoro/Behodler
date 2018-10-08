pragma solidity ^0.4.20;
import "../../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
library SafeOperations {
	using SafeMath for uint;
	uint constant uintMax = 2<<254;
	
	function safeRightShift(uint number, uint factor) internal pure returns (uint) {
		uint value = number >> factor;
		require (value <= number);
		return value;	
	}

	function safeLeftShift(uint number, uint factor) internal pure returns (uint) {
		uint value = number << factor;
		require (value >= number);
		return value;	
	}

	function square(uint value) internal pure returns (uint) {
		uint product = value.mul(value);
		if(product < value)
			return uintMax;
		return product;
	}

	function sqrt(uint x) internal pure returns (uint y) {
		uint z = (x + 1) / 2;
		y = x;
		while (z < y) {
			y = z;
			z = (x / z + z) / 2;
		}
		if(y>x)
			y = 0;
	}
}