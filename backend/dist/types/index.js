// Enums
export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PREPARING"] = "PREPARING";
    OrderStatus["READY"] = "READY";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (OrderStatus = {}));
export var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["ETH"] = "ETH";
    PaymentMethod["FOOD_TOKEN"] = "FOOD_TOKEN";
    PaymentMethod["FIAT"] = "FIAT";
})(PaymentMethod || (PaymentMethod = {}));
export var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["USER"] = "USER";
    UserRole["ORACLE_OPERATOR"] = "ORACLE_OPERATOR";
})(UserRole || (UserRole = {}));
//# sourceMappingURL=index.js.map