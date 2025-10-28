// SPDX-License-Identifier: MIT
//Bu dosya test amaçlı yazılmıştı. Artık kullanılmıyor.
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FOOD is ERC20, Ownable {
    constructor() ERC20("FoodToken", "FOOD") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 ether); // 18 decimal ile mint et
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
