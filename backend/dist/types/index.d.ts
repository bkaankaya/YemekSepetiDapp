export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    timestamp: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface OraclePriceUpdate {
    priceUSD: number;
    tokenAddress?: string;
    source?: string;
    timestamp?: number;
}
export interface OracleBatchUpdate {
    updates: OraclePriceUpdate[];
}
export interface OraclePrice {
    priceUSD: number;
    priceE18: string;
    lastUpdated: string;
    source: string;
}
export interface Customer {
    id: string;
    address: string;
    name?: string;
    email?: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Restaurant {
    id: string;
    address: string;
    name: string;
    description?: string;
    cuisine?: string;
    rating?: number;
    isActive: boolean;
    acceptsTokens: boolean;
    slippage: number;
    createdAt: string;
    updatedAt: string;
}
export interface MenuItem {
    id: string;
    restaurantId: string;
    name: string;
    description?: string;
    price: number;
    priceUSD: number;
    category?: string;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface Order {
    id: string;
    customerId: string;
    restaurantId: string;
    items: OrderItem[];
    totalAmount: number;
    totalAmountUSD: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    createdAt: string;
    updatedAt: string;
}
export interface OrderItem {
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
export interface PriceUpdate {
    id: string;
    tokenAddress?: string;
    oldPrice: number;
    newPrice: number;
    priceUSD: number;
    source: string;
    updatedBy: string;
    createdAt: string;
}
export interface User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
}
export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PREPARING = "PREPARING",
    READY = "READY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export declare enum PaymentMethod {
    ETH = "ETH",
    FOOD_TOKEN = "FOOD_TOKEN",
    FIAT = "FIAT"
}
export declare enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER",
    ORACLE_OPERATOR = "ORACLE_OPERATOR"
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export interface PaginationFilters {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
    acceptsTokens?: boolean;
}
export interface SubgraphResponse<T> {
    data: T;
    errors?: any[];
}
export interface SubgraphCustomer {
    id: string;
    address: string;
    name?: string;
    email?: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
}
export interface SubgraphRestaurant {
    id: string;
    address: string;
    name: string;
    description?: string;
    cuisine?: string;
    rating?: number;
    isActive: boolean;
    acceptsTokens: boolean;
    slippage: number;
    createdAt: string;
    updatedAt: string;
}
export interface SubgraphMenuItem {
    id: string;
    restaurant: {
        id: string;
    };
    name: string;
    description?: string;
    price: number;
    priceUSD: number;
    category?: string;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface SubgraphOrder {
    id: string;
    customer: {
        id: string;
    };
    restaurant: {
        id: string;
    };
    items: SubgraphOrderItem[];
    totalAmount: number;
    totalAmountUSD: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    createdAt: string;
    updatedAt: string;
}
export interface SubgraphOrderItem {
    menuItem: {
        id: string;
    };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}
export interface LoginRequest {
    username: string;
    password: string;
}
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}
export interface AuthResponse {
    user: Omit<User, 'passwordHash'>;
    token: string;
    refreshToken: string;
}
export interface JwtPayload {
    userId: string;
    username: string;
    role: UserRole;
    iat: number;
    exp: number;
}
export interface CoinGeckoPrice {
    [currency: string]: number;
}
export interface BinancePrice {
    symbol: string;
    price: string;
}
export interface LogEntry {
    level: string;
    message: string;
    timestamp: string;
    service: string;
    environment: string;
    metadata?: Record<string, any>;
}
export interface HealthStatus {
    status: 'OK' | 'ERROR';
    timestamp: string;
    service: string;
    version: string;
    environment: string;
    checks: {
        database: boolean;
        subgraph: boolean;
        oracle: boolean;
    };
}
//# sourceMappingURL=index.d.ts.map