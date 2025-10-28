// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOracle {
    // ETH tarafı: wei cinsinden gir, 1e18 ölçekli "fiyatlı miktar" döner
    function quoteEth(uint256 amountWei) external view returns (uint256);
    // Token tarafı: token adresi ve miktar gir, 1e18 ölçekli "fiyatlı miktar" döner
    function quoteToken(address token, uint256 amount) external view returns (uint256);
}

// IOracleV2 interface'ini ekleyin
interface IOracleV2 {
    function currentEthPriceE18() external view returns (uint256);
    function currentTokenPriceE18(address token) external view returns (uint256);
    function convertUsdToToken(uint256 usdAmountE18, address token) external view returns (uint256);
    function convertTokenToUsd(uint256 tokenAmount, address token) external view returns (uint256);
}

interface IERC20Metadata { function decimals() external view returns (uint8); }

import "@openzeppelin/contracts/access/AccessControl.sol"; //Yetkilendirme için hazır kaynak kullandım

/// @notice Yetkilendirmeli + event’li, push-tabanlı fiyat oracle’ı
/// - priceE18: 1 varlık başına 1e18 ölçekli “quote” (örn. USD) değeri
/// - quoteEth(amountWei) = amountWei * ethPriceE18 / 1e18
/// - quoteToken(token, amount) = amount * tokenPriceE18 / 10**tokenDecimals

contract DummyOracle is IOracle, IOracleV2, AccessControl {
    bytes32 public constant FEEDER_ROLE = keccak256("FEEDER_ROLE");

    string public quoteSymbol = "USD"; // bilgi amaçlı. Bu kısım kodda kullanılmıyor sadece dışarıdan bakan birisi hangi paranın kullanıldığını anlasın diye yazdım.

    // ETH fiyatı (1 ETH başına 1e18)
    uint256 public _ethPriceE18;
    uint256 public ethLastUpdatedAt;

    // Token fiyatları (1 token başına 1e18)
    mapping(address => uint256) public _tokenPriceE18;
    mapping(address => uint256) public tokenLastUpdatedAt;
    mapping(address => uint256) public tokenPrices;

  
    mapping(address => uint8) public tokenDecimals;

    // --- Events ---
    
    event EthPriceUpdated(uint256 priceE18, uint256 timestamp, address indexed updater);
    event TokenPriceUpdated(address indexed token, uint256 priceE18, uint256 timestamp, address indexed updater);
    event TokenDecimalsSet(address indexed token, uint8 decimals, address indexed setter);
    event FeederGranted(address indexed account);
    event FeederRevoked(address indexed account);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FEEDER_ROLE, msg.sender);
    }

    // --- Yetki ---
    function grantFeeder(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(FEEDER_ROLE, account);
        emit FeederGranted(account);
    }
    function revokeFeeder(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(FEEDER_ROLE, account);
        emit FeederRevoked(account);
    }
    function setTokenDecimals(address token, uint8 decimals_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(token != address(0), "token=0");
        tokenDecimals[token] = decimals_;
        emit TokenDecimalsSet(token, decimals_, msg.sender);
    }

    // --- Fiyat Güncelleme (sadece FEEDER) ---
    function setEthPrice(uint256 priceE18) external onlyRole(FEEDER_ROLE) {
        require(priceE18 > 0, "price=0");
        _ethPriceE18 = priceE18;
        ethLastUpdatedAt = block.timestamp; // güncelleme zamanı burada kaydediliyor
        emit EthPriceUpdated(priceE18, block.timestamp, msg.sender);  //  event ile dışarıya duyuruluyor
    }
    function setTokenPrice(address token, uint256 priceE18) external onlyRole(FEEDER_ROLE) {
        
        require(token != address(0), "token=0");
        require(priceE18 > 0, "price=0");
        
        //fiyatı 1 token başına 1e18 ölçek olacak şekilde kaydediyoruz
        _tokenPriceE18[token] = priceE18;
        tokenPrices[token] = priceE18; // okuma kolaylığı olsun diye tutuyoruz hani 1 token 1e18 ya

        // zaman damgası
        uint256 ts = block.timestamp;
        tokenLastUpdatedAt[token] = ts;

        // event (Graf için henüz graphql kurulmadı)
        emit TokenPriceUpdated(token, priceE18, ts, msg.sender);
        
    }

    // --- Getter’lar ---
    function getTokenPrice(address token) external view returns (uint256) {return tokenPrices[token];}
    function currentEthPriceE18() external view returns (uint256) { return _ethPriceE18; }
    function currentTokenPriceE18(address token) external view returns (uint256) { return _tokenPriceE18[token]; }

    // --- IOracle ---
    function quoteEth(uint256 amountWei) external view override returns (uint256) {
        return (amountWei * _ethPriceE18) / 1e18;
    }

    // USD miktarını FOOD token miktarına çevir
    function convertUsdToToken(uint256 usdAmountE18, address token) external view returns (uint256) {
        require(_tokenPriceE18[token] > 0, "Token price not set");
        // USD miktarını token fiyatına bölerek token miktarını bul
        return (usdAmountE18 * 1e18) / _tokenPriceE18[token];
    }

    // Token miktarını USD'ye çevir
    function convertTokenToUsd(uint256 tokenAmount, address token) external view returns (uint256) {
        require(_tokenPriceE18[token] > 0, "Token price not set");
        // Token miktarını token fiyatıyla çarparak USD miktarını bul
        return (tokenAmount * _tokenPriceE18[token]) / 1e18;
    }

    //Fiyatı usd cinsinden 1e18 olacak şekilde döndürür BUNU DİNAMİK YAPICAZ 6 DECIMAL KULLANANDA VAR
    function quoteToken(address token, uint256 amount) external view override returns (uint256) {
        uint256 p = _tokenPriceE18[token];
        require(p > 0, "price not set");

        uint8 dec = tokenDecimals[token];
        if (dec == 0) {
            try IERC20Metadata(token).decimals() returns (uint8 d) { dec = d; }
            catch { revert("decimals unknown"); }
        }
        return (p * amount) / (10 ** dec);
    }
}
