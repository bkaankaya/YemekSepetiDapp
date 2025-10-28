export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Customer extends BaseEntity {
    address: string;
    name: string;
    email: string;
    phone: string;
}
export interface Restaurant extends BaseEntity {
    address: string;
    name: string;
    description: string;
    cuisine: string;
    rating: number;
    isActive: boolean;
    acceptsTokens: boolean;
    slippage: number;
}
export interface MenuItem extends BaseEntity {
    restaurantId: string;
    name: string;
    description: string;
    price: number;
    priceUSD: number;
    category: string;
    isAvailable: boolean;
}
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PREPARING = "preparing",
    READY = "ready",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare enum PaymentMethod {
    ETH = "eth",
    FOOD_TOKEN = "food_token",
    FIAT = "fiat"
}
export interface Order extends BaseEntity {
    customerId: string;
    restaurantId: string;
    totalAmount: number;
    totalAmountUSD: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    items: OrderItem[];
}
export interface OrderItem {
    id: string;
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
export interface PriceUpdate extends BaseEntity {
    tokenAddress?: string;
    oldPrice: number;
    newPrice: number;
    priceUSD: number;
    source: string;
    updatedBy: string;
}
export declare enum UserRole {
    USER = "user",
    ORACLE_OPERATOR = "oracle_operator",
    ADMIN = "admin"
}
export interface User extends BaseEntity {
    username: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    lastLogin?: Date;
}
export declare const REDIS_KEYS: {
    readonly CUSTOMER: "customer";
    readonly RESTAURANT: "restaurant";
    readonly MENU_ITEM: "menu_item";
    readonly ORDER: "order";
    readonly ORDER_ITEM: "order_item";
    readonly PRICE_UPDATE: "price_update";
    readonly USER: "user";
    readonly INDEX: "index";
};
export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}
export interface PaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface CustomerFilters {
    search?: string;
}
export interface RestaurantFilters {
    search?: string;
    cuisine?: string;
    isActive?: boolean;
    acceptsTokens?: boolean;
}
export interface OrderFilters {
    status?: OrderStatus;
    paymentMethod?: PaymentMethod;
    customerId?: string;
    restaurantId?: string;
}
export interface PriceUpdateFilters {
    tokenAddress?: string;
    source?: string;
}
export interface UserFilters {
    role?: UserRole;
    isActive?: boolean;
}
//# sourceMappingURL=types.d.ts.map