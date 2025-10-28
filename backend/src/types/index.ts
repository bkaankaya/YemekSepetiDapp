// API Response Types
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

// Oracle Types
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

// Subgraph Types - Smart contract ile uyumlu
export interface SubgraphCustomer {
  id: string;
  walletAddress: string;        // Smart contract'taki walletAddress
  realWorldAddress: string;     // Smart contract'taki realWorldAddress
  createdAt: string;
  updatedAt: string;
}

export interface SubgraphRestaurant {
  id: string;
  walletAddress: string;        // Smart contract'taki walletAddress
  realWorldAddress: string;     // Smart contract'taki realWorldAddress
  defaultSlippageBps: number;   // Smart contract'taki defaultSlippageBps
  createdAt: string;
  updatedAt: string;
}

export interface SubgraphMenuItem {
  id: string;
  name: string;                 // Smart contract'taki name
  restaurant: {
    walletAddress: string;      // Restaurant wallet address
  };
  priceQuote: number;           // Smart contract'taki priceQuote
  priceQuoteDecimals: number;   // Smart contract'taki priceQuoteDecimals
  acceptedTokens: string[];     // Smart contract'taki acceptedTokens
  createdAt: string;
  updatedAt: string;
}

export interface SubgraphOrder {
  id: string;
  orderId: number;              // Smart contract'taki id
  customer: {
    walletAddress: string;      // Customer wallet address
  };
  restaurant: {
    walletAddress: string;      // Restaurant wallet address
  };
  itemName: string;             // Smart contract'taki itemName
  price: number;                // Smart contract'taki price
  paymentToken: string;         // Smart contract'taki paymentToken
  status: string;               // Smart contract'taki status
  createdAt: string;
  updatedAt: string;
  blockNumber: number;          // Blockchain block number
  transactionHash: string;      // Transaction hash
}

// Subgraph Response Type
export interface SubgraphResponse<T> {
  data: T;
  errors?: any[];
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

// Legacy types (deprecated - smart contract ile uyumlu değil)
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
  timestamp: string;
}

// Enums
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  ETH = 'eth',
  FOOD_TOKEN = 'food_token',
  FIAT = 'fiat'
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  USER = 'user',
  ORACLE_OPERATOR = 'oracle_operator',
  ADMIN = 'admin'
}

// Filter Types
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
