// Order status enum
export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["CONFIRMED"] = "confirmed";
    OrderStatus["PREPARING"] = "preparing";
    OrderStatus["READY"] = "ready";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (OrderStatus = {}));
// Payment method enum
export var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["ETH"] = "eth";
    PaymentMethod["FOOD_TOKEN"] = "food_token";
    PaymentMethod["FIAT"] = "fiat";
})(PaymentMethod || (PaymentMethod = {}));
// User role enum
export var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ORACLE_OPERATOR"] = "oracle_operator";
    UserRole["ADMIN"] = "admin";
})(UserRole || (UserRole = {}));
// Redis key patterns
export const REDIS_KEYS = {
    CUSTOMER: 'customer',
    RESTAURANT: 'restaurant',
    MENU_ITEM: 'menu_item',
    ORDER: 'order',
    ORDER_ITEM: 'order_item',
    PRICE_UPDATE: 'price_update',
    USER: 'user',
    INDEX: 'index'
};
//# sourceMappingURL=types.js.map