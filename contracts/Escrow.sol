// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Escrow {
    address public immutable allowedCaller; // YemekSepeti kontrat adresi

    struct Hold {
        uint256 amount;
        address payer;
        address token;
        address payee;
        bool releasedOrRefunded;
    }

    mapping(uint256 => Hold) public holds;

    modifier onlyCaller() {
        require(msg.sender == allowedCaller, "only YemekSepeti");
        _;
    }

    constructor(address _allowedCaller) {
        allowedCaller = _allowedCaller;
    }

    event Deposited(uint256 indexed orderId, address payer, address payee, uint256 amount); // ETH
    event DepositedToken(uint256 indexed orderId, address payer, address payee, address token, uint256 amount); // ERC20
    event Released(uint256 indexed orderId, address to, uint256 amount);
    event Refunded(uint256 indexed orderId, address to, uint256 amount);

    receive() external payable { revert("Use deposit()"); }
    fallback() external payable { revert("Use deposit()"); }

    // ETH yatırma
    function deposit(uint256 orderId, address payer, address payee)
        external
        payable
        onlyCaller
    {
        require(msg.value > 0, "zero ETH");
        require(holds[orderId].amount == 0 && !holds[orderId].releasedOrRefunded, "already deposited");

        holds[orderId] = Hold({
            amount: msg.value,
            payer: payer,
            token: address(0), // ETH için token adresi yok
            payee: payee,
            releasedOrRefunded: false
        });

        emit Deposited(orderId, payer, payee, msg.value);
    }

    // Token yatırma
    function depositToken(
        uint256 orderId,
        address payer,
        address payee,
        address token,
        uint256 amount
    ) external onlyCaller {
        require(amount > 0, "zero token amount");
        require(holds[orderId].amount == 0 && !holds[orderId].releasedOrRefunded, "already deposited");

        // Önceden approve verilmeli
        require(IERC20(token).transferFrom(payer, address(this), amount), "transferFrom failed");

        holds[orderId] = Hold({
            amount: amount,
            payer: payer,
            token: token,
            payee: payee,
            releasedOrRefunded: false
        });

        emit DepositedToken(orderId, payer, payee, token, amount);
    }

    // Ödemeyi serbest bırakma
    function release(uint256 orderId) external onlyCaller {
        Hold storage h = holds[orderId];
        require(!h.releasedOrRefunded && h.amount > 0, "invalid");
        h.releasedOrRefunded = true;

        if (h.token == address(0)) {
            // transfer yerine call kullan (2300 gas limitini kaldır)
            (bool ok, ) = payable(h.payee).call{value: h.amount}("");
            require(ok, "ETH transfer failed");
        } else {
            require(IERC20(h.token).transfer(h.payee, h.amount), "token transfer failed");
        }

        emit Released(orderId, h.payee, h.amount);
    }

    // Token'ı USD'ye çevir ve restorana gönder 
    function releaseTokenAsUsd(uint256 orderId, address oracleAddress) external onlyCaller {
        Hold storage h = holds[orderId];
        require(!h.releasedOrRefunded && h.amount > 0, "invalid");
        require(h.token != address(0), "not a token order");
        h.releasedOrRefunded = true;

        // Oracle'dan token fiyatını al ve USD'ye çevir
        // Bu fonksiyon sadece YemekSepeti kontratından çağrılabilir
        // Restoran token'ı USD olarak almak isterse bu fonksiyon kullanılır
        
        // Şimdilik basit token transfer yapıyoruz
        // Gelecekte DEX entegrasyonu eklenebilir
        require(IERC20(h.token).transfer(h.payee, h.amount), "token transfer failed");
        
        emit Released(orderId, h.payee, h.amount);
    }

    // Ödemeyi iade etme
    function refund(uint256 orderId) external onlyCaller {
        Hold storage h = holds[orderId];
        require(!h.releasedOrRefunded && h.amount > 0, "invalid");
        h.releasedOrRefunded = true;

        if (h.token == address(0)) {
            // transfer yerine call kullan (2300 gas limitini kaldır)
            (bool ok, ) = payable(h.payer).call{value: h.amount}("");
            require(ok, "ETH transfer failed");
        } else {
            require(IERC20(h.token).transfer(h.payer, h.amount), "token transfer failed");
        }

        emit Refunded(orderId, h.payer, h.amount);
    }

    // Escrow'daki tutarı okuma fonksiyonu
    function getHoldAmount(uint256 orderId) external view returns (uint256) {
        return holds[orderId].amount;
    }
}
