// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol"; //Kullanılmıyor onun yerine lowWei kullanılıyor
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol"; // ERC20 token’ların decimals(), symbol() gibi ek metadata fonksiyonlarını kullanmak için.
import "@openzeppelin/contracts/access/Ownable.sol";

interface IEscrow {
    function deposit(
        uint256 orderId,
        address payer,
        address payee
    ) external payable;

    // dikkat: önce müşteri, bu kontrata escrow'un token çekmesi için approve vermiş olmalı
    function depositToken(
        uint256 orderId,
        address payer,
        address payee,
        address token,
        uint256 amount
    ) external;

    function release(uint256 orderId) external;

    function refund(uint256 orderId) external;

    // Belirli bir sipariş (orderId) için escrow kontratında tutulan (henüz serbest bırakılmamış) bakiye miktarını döndürür
    function getHoldAmount(uint256 orderId) external view returns (uint256);
}

interface IOracle {
    // Verilen ETH miktarının USD değerini döndürür
    function quoteEth(uint256 amountWei) external view returns (uint256);
    
    // Verilen token miktarının USD değerini döndürür
    function quoteToken(
        address token,
        uint256 amount
    ) external view returns (uint256);
}

// Oracle V2 getter'ları (fiyatı doğrudan çekmek için)
interface IOracleV2 is IOracle {
    function currentEthPriceE18() external view returns (uint256);

    function currentTokenPriceE18(
        address token
    ) external view returns (uint256);

    function convertUsdToToken(
        uint256 usdAmountE18,
        address token
    ) external view returns (uint256);

    function convertTokenToUsd(
        uint256 tokenAmount,
        address token
    ) external view returns (uint256);
}

enum PriceMode {
    USD_DYNAMIC_ETH,
    USD_DYNAMIC_TOKEN
}

contract YemekSepeti is Ownable {
    IEscrow public escrow;

    IOracle public oracle;

    uint256 public orderCounter;

    struct Customer {
        address walletAddress;
        string realWorldAddress;
    }

    struct Restaurant {
        address walletAddress;
        string realWorldAddress;
        mapping(string => uint256) menuPriceQuote; // FIAT fiyatı "kendi scale"ında (örn 1e6 ya da 1e18)
        mapping(string => uint8) menuPriceQuoteDecimals; // ör: 6 veya 18 decimal
        mapping(string => mapping(address => bool)) acceptedToken; // item -> token -> kabul mü
        uint16 defaultSlippageBps; // ör: 100 = %1
        mapping(string => uint16) itemSlippageBps;
    }

    struct Order {
        uint256 id;
        address customer;
        address restaurant;
        string itemName;
        uint256 price;
        address paymentToken; // address(0) => ETH, aksi halde ERC20 mantık bu şekilde
        OrderStatus status;
    }

    //  Çok-ürün desteği: her siparişin kalemleri
    struct OrderItem {
        string name; // ürün adı
        uint256 qty; // adet
        uint256 amount; // bu kalemin tutarı (ETH ise wei, token ise token miktarı; qty dahil)
    }

    mapping(uint256 => OrderItem[]) public orderItems; //Her siparişin kalemlerini depoluyoruz

    enum OrderStatus {
        Placed,
        Confirmed,
        CancelReqByCustomer,
        CancelReqByRestaurant,
        Cancelled,
        Completed
    }

    mapping(uint256 => Order) public orders;
    mapping(address => Customer) public customers;
    mapping(address => Restaurant) public restaurants;

    event OrderCreated(
        uint256 indexed orderId,
        address indexed customer,
        address indexed restaurant,
        string itemName
    );
    event OrderConfirmed(uint256 indexed orderId);
    event OrderCancelled(uint256 indexed orderId);
    event OrderStatusUpdated(uint256 indexed orderId, OrderStatus newStatus);
    event Debug(string message, uint256 orderId, uint256 value, address sender);
    event Debug(string message, address customer, address paymentToken, uint256 totalAmount);
    event Debug(string message, uint256 holdAmount);
    event DefaultSlippageUpdated(address indexed restaurant, uint16 bps);
    event ItemSlippageUpdated(
        address indexed restaurant,
        string item,
        uint16 bps
    );

    // YemekSepeti kontratını başlat ve deploy eden adresi owner yap
    constructor() Ownable(msg.sender) {
        // Varsayılan slippage'ı %20 (2000 bps) olarak ayarla
        // Bu sayede yeni restoranlar otomatik olarak %20 slippage ile çalışacak
    }

    function _effectiveSlippageBps(
        Restaurant storage r,
        string memory _item
    ) internal view returns (uint16) {
        uint16 bps = r.itemSlippageBps[_item]; // item özel ayar varsa onu al
        if (bps == 0) {
            bps = r.defaultSlippageBps; // yoksa restoran default
        }
        return bps; // default da 0 ise, slippage yok demektir
    }

    function setDefaultSlippageBps(
        uint16 bps
    ) external onlyRegisteredRestaurant {
        require(bps <= 2000, "slippage too big"); // %20 tavan
        restaurants[msg.sender].defaultSlippageBps = bps;
        emit DefaultSlippageUpdated(msg.sender, bps);
    }

    // Belirli bir item icin slippage (bps)
    // Not: 0 verirsen "item'a ozel ayar yok" kabul edilir, default'a düşer
    function setItemSlippageBps(
        string memory _item,
        uint16 bps
    ) external onlyRegisteredRestaurant {
        require(bytes(_item).length > 0, "Empty item");
        require(bps <= 2000, "slippage too big");
        restaurants[msg.sender].itemSlippageBps[_item] = bps;
        emit ItemSlippageUpdated(msg.sender, _item, bps);
    }

    function setOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "bad oracle");
        oracle = IOracle(_oracle);
    }

    function registerCustomer(string memory _realWorldAddress) external {
        customers[msg.sender] = Customer(msg.sender, _realWorldAddress);
    }

    function registerRestaurant(string memory _realWorldAddress) external {
        Restaurant storage r = restaurants[msg.sender];
        r.walletAddress = msg.sender;
        r.realWorldAddress = _realWorldAddress;
        // Yeni restoranlar için varsayılan slippage'ı %20 (2000 bps) olarak ayarla
        r.defaultSlippageBps = 2000;
    }

    // FIAT (USD/TRY) sabit fiyat gir
    function setMenuPriceQuote(
        string memory _item,
        uint256 _price,
        uint8 _quoteDecimals
    ) external onlyRegisteredRestaurant {
        require(bytes(_item).length > 0, "Empty item");
        require(_price > 0, "Price must be > 0");
        require(_quoteDecimals <= 18, "too big"); // 18 decimalin üstüne çıkartmıyoruz.

        restaurants[msg.sender].menuPriceQuote[_item] = _price; //Restoran bir ürünün USD fiyatını (_price) ve kaç decimal olduğunu (_quoteDecimals) kontrata kaydediyor.
        restaurants[msg.sender].menuPriceQuoteDecimals[_item] = _quoteDecimals;
    }

    // Menü fiyatını oku (herhangi bir restoranın menüsünü okuyabilir)
    function getMenuPriceQuote(
        address _restaurant,
        string memory _item
    ) external view returns (uint256 priceUSD, uint8 decimals) {
        Restaurant storage r = restaurants[_restaurant];
        require(r.walletAddress != address(0), "Restaurant not registered");

        priceUSD = r.menuPriceQuote[_item];
        decimals = r.menuPriceQuoteDecimals[_item];

        require(priceUSD > 0, "Item not found in menu");
    }

    // Token kabul edilip edilmediğini kontrol et
    function isTokenAccepted(
        address _restaurant,
        string memory _item,
        address _token
    ) external view returns (bool) {
        Restaurant storage r = restaurants[_restaurant];
        require(r.walletAddress != address(0), "Restaurant not registered");

        return r.acceptedToken[_item][_token];
    }

    // Bu item için hangi token'larla ödeme kabul edilsin?
    function setAcceptedToken(
        string memory _item,
        address _token,
        bool _ok
    ) external onlyRegisteredRestaurant {
        require(bytes(_item).length > 0, "Empty item");
        // ETH için _token = address(0) kabul EDİLİR
        restaurants[msg.sender].acceptedToken[_item][_token] = _ok;
    }

    // Müşterinin gönderdiği ETH'yi USD'ye çevir, slippage USD cinsinden kontrol et
    function createOrderETHDynamicMany(
        address _restaurant,
        string[] calldata _items,
        uint256[] calldata _qtys
    ) external payable onlyRegisteredCustomer {
        require(
            _items.length == _qtys.length && _items.length > 0,
            "bad lengths"
        );

        Restaurant storage r = restaurants[_restaurant];
        require(r.walletAddress != address(0), "Unknown restaurant");
        require(address(oracle) != address(0), "Oracle not set");

        // 1. Menüdeki USD toplamını hesapla (18 decimal)
        uint256 menuTotalUSD = 0;
        for (uint256 i = 0; i < _items.length; i++) {
            uint256 fiat = r.menuPriceQuote[_items[i]];
            uint8 qDec = r.menuPriceQuoteDecimals[_items[i]];
            if (qDec == 0) qDec = 18;
            require(fiat > 0, "no fiat price");

            // USD tutarını hesapla (18 decimal)
            // fiat zaten cent cinsinden, 18 decimal'a çevir
            uint256 itemUSD = fiat * _qtys[i] * (10 ** (18 - qDec));
            menuTotalUSD += itemUSD;
        }

        // 2. Oracle'dan ETH fiyatını al ve gerekli ETH miktarını hesapla
        uint256 ethPriceE18 = IOracleV2(address(oracle)).currentEthPriceE18();
        require(ethPriceE18 > 0, "ETH price missing");

        // Gerekli ETH = (menuTotalUSD * 1e18) / ethPriceE18
        uint256 requiredWei = (menuTotalUSD * 1e18) / ethPriceE18;

        // 3. Slippage kontrolü (ETH cinsinden) - %10 TOLERANS
        uint256 lowWei = (requiredWei * 90) / 100; // %10 alt sınır
        uint256 highWei = (requiredWei * 110) / 100; // %10 üst sınır

        require(
            msg.value >= lowWei && msg.value <= highWei,
            "price moved - check slippage (10% tolerance)"
        );

        uint256 orderId = orderCounter++;
        orders[orderId] = Order(
            orderId,
            msg.sender,
            _restaurant,
            "MULTI",
            msg.value,
            address(0),
            OrderStatus.Placed
        );

        // kalemleri kaydet
        for (uint256 i = 0; i < _items.length; i++) {
            orderItems[orderId].push(
                OrderItem({
                    name: _items[i],
                    qty: _qtys[i],
                    amount: (msg.value * _qtys[i]) / _qtys.length // Eşit dağıtım
                })
            );
        }

        // Escrow'a para yatır
        escrow.deposit{value: msg.value}(orderId, msg.sender, _restaurant);

        emit OrderCreated(orderId, msg.sender, _restaurant, "MULTI");
    }

    // ==== ÇOK-ÜRÜN: TOKEN ====
    // YENİ MANTIK: Müşteri token gönderir, sistem USD'ye çevirip menü fiyatıyla karşılaştırır
    function createOrderTokenDynamicMany(
        address _restaurant,
        string[] calldata _items,
        uint256[] calldata _qtys,
        address _token,
        uint256 _tokenAmount
    ) external onlyRegisteredCustomer {
        require(
            _items.length == _qtys.length && _items.length > 0,
            "bad lengths"
        );
        require(_tokenAmount > 0, "token amount required");

        Restaurant storage r = restaurants[_restaurant];
        require(r.walletAddress != address(0), "Unknown restaurant");
        require(address(oracle) != address(0), "Oracle not set");

        // 1. Menüdeki USD toplamını hesapla (18 decimal)
        uint256 menuTotalUSD = 0;
        for (uint256 i = 0; i < _items.length; i++) {
            require(r.acceptedToken[_items[i]][_token], "token not accepted");

            uint256 fiat = r.menuPriceQuote[_items[i]];
            uint8 qDec = r.menuPriceQuoteDecimals[_items[i]];
            if (qDec == 0) qDec = 18;
            require(fiat > 0, "no fiat price");

            // USD tutarını hesapla (18 decimal)
            // fiat zaten cent cinsinden, 18 decimal'a çevir
            uint256 itemUSD = fiat * _qtys[i] * (10 ** (18 - qDec));
            menuTotalUSD += itemUSD;
        }

        // 2. Oracle'dan token fiyatını al ve gerekli token miktarını hesapla
        uint256 tokenPriceE18 = IOracleV2(address(oracle)).currentTokenPriceE18(
            _token
        );
        require(tokenPriceE18 > 0, "token price missing");

        // Gerekli token = (menuTotalUSD * 1e18) / tokenPriceE18
        uint256 requiredTokens = (menuTotalUSD * 1e18) / tokenPriceE18;

        // 3. Slippage kontrolü (token cinsinden) - %10 TOLERANS
        uint256 lowTokens = (requiredTokens * 90) / 100; // %10 alt sınır
        uint256 highTokens = (requiredTokens * 110) / 100; // %10 üst sınır

        require(
            _tokenAmount >= lowTokens && _tokenAmount <= highTokens,
            "price moved - check slippage (10% tolerance)"
        );

        uint256 orderId = orderCounter++;
        orders[orderId] = Order(
            orderId,
            msg.sender,
            _restaurant,
            "MULTI",
            _tokenAmount,
            _token,
            OrderStatus.Placed
        );

        // kalemleri kaydet
        for (uint256 i = 0; i < _items.length; i++) {
            orderItems[orderId].push(
                OrderItem({
                    name: _items[i],
                    qty: _qtys[i],
                    amount: (_tokenAmount * _qtys[i]) / _qtys.length // Eşit dağıtım
                })
            );
        }

        // Token'ları escrow kontratına yatır (müşteri önceden approve vermiş olmalı)
        escrow.depositToken(
            orderId,
            msg.sender,
            _restaurant,
            _token,
            _tokenAmount
        );

        emit OrderCreated(orderId, msg.sender, _restaurant, "MULTI");
    }

    // USD → TOKEN OTOMATİK ÇEVRİM ====
    function createOrderUsdToToken(
        address _restaurant,
        string[] calldata _items,
        uint256[] calldata _qtys,
        address _token
    ) external onlyRegisteredCustomer {
        require(
            _items.length == _qtys.length && _items.length > 0,
            "bad lengths"
        );

        Restaurant storage r = restaurants[_restaurant];
        require(r.walletAddress != address(0), "Unknown restaurant");
        require(address(oracle) != address(0), "Oracle not set");

        // USD toplam tutarını hesapla
        uint256 totalUsdE18 = 0;
        for (uint256 i = 0; i < _items.length; i++) {
            uint256 fiat = r.menuPriceQuote[_items[i]];
            uint8 qDec = r.menuPriceQuoteDecimals[_items[i]];
            if (qDec == 0) qDec = 18;
            require(fiat > 0, "no fiat price");

            // USD tutarını hesapla (18 decimal)
            // fiat zaten cent cinsinden, 18 decimal'a çevir
            uint256 itemUsdE18 = fiat * _qtys[i] * (10 ** (18 - qDec));
            totalUsdE18 += itemUsdE18;
        }

        // USD'yi token'a çevir
        uint256 requiredTokens = IOracleV2(address(oracle)).convertUsdToToken(
            totalUsdE18,
            _token
        );
        require(requiredTokens > 0, "token conversion failed");

        uint256 orderId = orderCounter++;

        // Önce siparişi kaydet
        orders[orderId] = Order(
            orderId,
            msg.sender,
            _restaurant,
            "MULTI",
            requiredTokens,
            _token,
            OrderStatus.Placed
        );

        // Sonra token'ı escrow'a yatır
        escrow.depositToken(
            orderId,
            msg.sender,
            _restaurant,
            _token,
            requiredTokens
        );

        // Kalemleri kaydet
        for (uint256 i = 0; i < _items.length; i++) {
            orderItems[orderId].push(
                OrderItem({
                    name: _items[i],
                    qty: _qtys[i],
                    amount: (requiredTokens * _qtys[i]) / _qtys.length // Eşit dağıtım
                })
            );
        }

        emit OrderCreated(orderId, msg.sender, _restaurant, "MULTI");
    }

    function cancelOrder(uint256 _orderId) external {
        Order storage order = orders[_orderId];

        // Hem müşteri hem restaurant iptal edebilir
        require(
            msg.sender == order.customer || msg.sender == order.restaurant,
            "Only customer or restaurant can cancel"
        );
        
        // Placed, Confirmed ve Completed durumundaki siparişler iptal edilebilir
        require(
            order.status == OrderStatus.Placed || 
            order.status == OrderStatus.Confirmed || 
            order.status == OrderStatus.Completed,
            "Cannot cancel order in this status"
        );

        orders[_orderId].status = OrderStatus.Cancelled;

        // Escrow'dan müşteriye iade
        escrow.refund(_orderId);

        emit OrderCancelled(_orderId);
    }

    function getOrder(
        uint256 _orderId
    )
        external
        view
        returns (
            address customer,
            address restaurant,
            string memory itemName,
            uint256 price,
            OrderStatus status
        )
    {
        Order storage order = orders[_orderId]; // Daha öncesinde kaydettiğimiz siparişin detaylarını burada çekip kullanıyoruz
        return (
            order.customer,
            order.restaurant,
            order.itemName,
            order.price,
            order.status
        );
    }

    // ==== Okuma yardımcıları (çok-ürün) ====
    function getOrderItemsCount(
        uint256 _orderId
    ) external view returns (uint256) {
        return orderItems[_orderId].length;
    }

    function getOrderItem(
        uint256 _orderId,
        uint256 index
    ) external view returns (string memory name, uint256 qty, uint256 amount) {
        OrderItem storage it = orderItems[_orderId][index];
        return (it.name, it.qty, it.amount);
    }

    // ==== ÇOK-ÜRÜN QUOTE (toplam) ====
    function getRequiredPaymentMany(
        address _restaurant,
        string[] memory _items,
        uint256[] memory _qtys,
        address _payToken
    ) public view returns (uint256 totalAmount, PriceMode mode) {
        require(
            _items.length == _qtys.length && _items.length > 0,
            "bad lengths"
        );
        Restaurant storage r = restaurants[_restaurant];
        require(r.walletAddress != address(0), "Unknown restaurant");
        require(address(oracle) != address(0), "Oracle not set");

        if (_payToken == address(0)) {
            mode = PriceMode.USD_DYNAMIC_ETH;
            uint256 ethPriceE18 = IOracleV2(address(oracle))
                .currentEthPriceE18();
            require(ethPriceE18 > 0, "ETH price missing");

            for (uint256 i = 0; i < _items.length; i++) {
                uint256 fiat = r.menuPriceQuote[_items[i]];
                uint8 qDec = r.menuPriceQuoteDecimals[_items[i]];
                if (qDec == 0) qDec = 18;
                require(fiat > 0, "no fiat price");

                // USD tutarını hesapla (18 decimal)
                // fiat zaten cent cinsinden, 18 decimal'a çevir
                uint256 itemUSD = fiat * _qtys[i] * (10 ** (18 - qDec));

                // USD'yi ETH'ye çevir
                uint256 lineWei = (itemUSD * 1e18) / ethPriceE18;
                totalAmount += lineWei;
            }
        } else {
            mode = PriceMode.USD_DYNAMIC_TOKEN;
            uint256 tokenPriceE18 = IOracleV2(address(oracle))
                .currentTokenPriceE18(_payToken);
            require(tokenPriceE18 > 0, "token price missing");
            uint8 dec = IERC20Metadata(_payToken).decimals();

            for (uint256 i = 0; i < _items.length; i++) {
                require(
                    r.acceptedToken[_items[i]][_payToken],
                    "token not accepted"
                );
                uint256 fiat = r.menuPriceQuote[_items[i]];
                uint8 qDec = r.menuPriceQuoteDecimals[_items[i]];
                if (qDec == 0) qDec = 18;
                require(fiat > 0, "no fiat price");

                // USD tutarını hesapla (18 decimal)
                // fiat zaten cent cinsinden, 18 decimal'a çevir
                uint256 itemUSD = fiat * _qtys[i] * (10 ** (18 - qDec));

                // USD'yi token'a çevir
                uint256 lineToken = (itemUSD * (10 ** dec)) / tokenPriceE18;
                totalAmount += lineToken;
            }
        }
        return (totalAmount, mode);
    }

    // Tek ürün için quote (geriye dönük uyumluluk)
    function getRequiredPayment(
        address _restaurant,
        string memory _item,
        address _payToken
    ) public view returns (uint256) {
        string[] memory items = new string[](1);
        uint256[] memory qtys = new uint256[](1);
        items[0] = _item;
        qtys[0] = 1;

        (uint256 amount, ) = getRequiredPaymentMany(
            _restaurant,
            items,
            qtys,
            _payToken
        );
        return amount;
    }

    function confirmOrder(
        uint256 _orderId
    ) external payable onlyOrderRestaurant(_orderId) onlyUnconfirmed(_orderId) {
        // DEBUG: Log gelen parametreleri
        emit Debug("confirmOrder called", _orderId, msg.value, msg.sender);
        
        Order storage order = orders[_orderId];
        emit Debug("Order details", order.customer, order.paymentToken, order.price);

        // Escrow'daki tutarı öğren (MetaMask'ta göstermek için)
        uint256 holdAmount = escrow.getHoldAmount(_orderId);
        emit Debug("Hold amount from escrow", holdAmount);

        orders[_orderId].status = OrderStatus.Confirmed;

        // Escrow'dan restoranın hesabına ödeme çıkar
        escrow.release(_orderId);

        // MetaMask Activity'de görünmesi için
        if (order.paymentToken == address(0) && holdAmount > 0) {
            // ETH siparişi: Tutarı göster (Activity'de görünür olması için)
            require(msg.value >= holdAmount, "Send ETH to show in activity");

            // Aynı tutarı geri ver (sadece görünürlük için) - transfer yerine call kullan
            (bool ok1, ) = payable(msg.sender).call{value: holdAmount}("");
            require(ok1, "ETH echo-back failed");

            // Fazla gönderileni de geri ver
            if (msg.value > holdAmount) {
                (bool ok2, ) = payable(msg.sender).call{value: msg.value - holdAmount}("");
                require(ok2, "ETH excess refund failed");
            }
        } else if (order.paymentToken != address(0) && holdAmount > 0) {
            // Token siparişi: Token işlemi zaten Escrow'da yapıldı
            // Müşteri approve verdi (MetaMask'ta görünür)
            // Restoran token aldı (MetaMask'ta görünür)

            // Fazla ETH gönderilmişse geri ver
            if (msg.value > 0) {
                (bool ok3, ) = payable(msg.sender).call{value: msg.value}("");
                require(ok3, "ETH refund failed");
            }
        } else if (msg.value > 0) {
            // Fazla ETH gönderilmişse geri ver
            (bool ok4, ) = payable(msg.sender).call{value: msg.value}("");
            require(ok4, "ETH refund failed");
        }

        emit OrderConfirmed(_orderId);
    }

    // Sipariş durumunu güncelle
    function updateOrderStatus(
        uint256 _orderId,
        OrderStatus _newStatus
    ) external onlyOrderRestaurant(_orderId) {
        // İş akışı: önce onaylanmış olmalı
        require(
            orders[_orderId].status == OrderStatus.Confirmed,
            "Must be confirmed"
        );

        // İstersen burada izin verilen hedef durumları kısıtlayabilirsin
        // require(_newStatus == OrderStatus.Completed, "Only complete allowed");

        orders[_orderId].status = _newStatus;
        emit OrderStatusUpdated(_orderId, _newStatus);
    }

    // Siparişi iptal et ve escrow'dan parayı müşteriye iade et
    function cancelOrderAndRefund(
        uint256 _orderId
    ) external onlyOrderRestaurant(_orderId) {
        Order storage order = orders[_orderId];
        
        // Placed, Confirmed ve Completed durumundaki siparişler iptal edilebilir
        require(
            order.status == OrderStatus.Placed || 
            order.status == OrderStatus.Confirmed || 
            order.status == OrderStatus.Completed,
            "Cannot cancel order in this status"
        );
        
        // Sipariş durumunu iptal olarak güncelle
        orders[_orderId].status = OrderStatus.Cancelled;
        
        // Escrow'dan parayı müşteriye iade et
        escrow.refund(_orderId);
        
        emit OrderCancelled(_orderId);
    }

    function setEscrow(address _escrow) external onlyOwner {
        require(address(escrow) == address(0), "Escrow already set");
        require(_escrow != address(0), "bad escrow");
        escrow = IEscrow(_escrow);
    }

    modifier onlyRegisteredCustomer() {
        require(
            customers[msg.sender].walletAddress != address(0),
            "Not a registered customer"
        );
        _;
    }

    modifier onlyRegisteredRestaurant() {
        require(
            restaurants[msg.sender].walletAddress != address(0),
            "Not a registered restaurant"
        );
        _;
    }

    modifier onlyOrderCustomer(uint256 _orderId) {
        require(orders[_orderId].customer == msg.sender, "Not order customer");
        _;
    }

    modifier onlyOrderRestaurant(uint256 _orderId) {
        require(
            orders[_orderId].restaurant == msg.sender,
            "Not order restaurant"
        );
        _;
    }

    modifier onlyUnconfirmed(uint256 _orderId) {
        require(
            orders[_orderId].status == OrderStatus.Placed,
            "Order already confirmed or processed"
        );
        _;
    }

    // Restoran için siparişleri oku
    function getRestaurantOrders(
        address _restaurant
    ) external view returns (uint256[] memory) {
        require(
            restaurants[_restaurant].walletAddress != address(0),
            "Restaurant not registered"
        );

        uint256[] memory restaurantOrders = new uint256[](orderCounter);
        uint256 count = 0;

        for (uint256 i = 0; i < orderCounter; i++) {
            if (orders[i].restaurant == _restaurant) {
                restaurantOrders[count] = i;
                count++;
            }
        }

        // Gerçek boyuta göre array'i yeniden boyutlandır
        assembly {
            mstore(restaurantOrders, count)
        }

        return restaurantOrders;
    }

    // Sipariş sayısını döndür
    function getTotalOrders() external view returns (uint256) {
        return orderCounter;
    }

    // Sipariş sayısını döndür (alternatif isim)
    function orderCount() external view returns (uint256) {
        return orderCounter;
    }

    // Sipariş item'larını oku
    function getOrderItems(
        uint256 _orderId
    ) external view returns (OrderItem[] memory) {
        require(orders[_orderId].id == _orderId, "Order not found");
        return orderItems[_orderId];
    }

    receive() external payable {
    //Kullanıcıların yanlışlıkla ya da sistem dışı yollarla ETH göndermesini engellemek. Ödeme sadece tanımlı createOrder fonksiyonları üzerinden yapılabiliyor.

        revert("Direct ETH not accepted");
    }

    fallback() external payable {
        revert("Direct ETH not accepted");
    }
}
