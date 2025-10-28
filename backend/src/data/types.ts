// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer entity - Smart contract ile uyumlu
export interface Customer extends BaseEntity {
  walletAddress: string;        // Smart contract'taki walletAddress
  realWorldAddress: string;     // Smart contract'taki realWorldAddress
}

// Restaurant entity - Smart contract ile uyumlu
export interface Restaurant extends BaseEntity {
  walletAddress: string;        // Smart contract'taki walletAddress
  realWorldAddress: string;     // Smart contract'taki realWorldAddress
  defaultSlippageBps: number;   // Smart contract'taki defaultSlippageBps
}

// Menu item entity - Smart contract ile uyumlu
export interface MenuItem extends BaseEntity {
  name: string;                 // Smart contract'taki name
  restaurant: string;           // Restaurant wallet address
  priceQuote: number;           // Smart contract'taki priceQuote
  priceQuoteDecimals: number;   // Smart contract'taki priceQuoteDecimals
  acceptedTokens: string[];     // Smart contract'taki acceptedTokens
}

// Item slippage entity - Smart contract ile uyumlu
export interface ItemSlippage extends BaseEntity {
  restaurant: string;           // Restaurant wallet address
  itemName: string;             // Smart contract'taki itemName
  slippageBps: number;          // Smart contract'taki slippageBps
}

// Order status enum - Smart contract ile uyumlu
export enum OrderStatus {
  Placed = 'Placed',
  Confirmed = 'Confirmed',
  CancelReqByCustomer = 'CancelReqByCustomer',
  CancelReqByRestaurant = 'CancelReqByRestaurant',
  Cancelled = 'Cancelled',
  Completed = 'Completed'
}

// Order entity - Smart contract ile uyumlu
export interface Order extends BaseEntity {
  orderId: number;              // Smart contract'taki id
  customer: string;             // Customer wallet address
  restaurant: string;           // Restaurant wallet address
  itemName: string;             // Smart contract'taki itemName
  price: number;                // Smart contract'taki price
  paymentToken: string;         // Smart contract'taki paymentToken
  status: OrderStatus;          // Smart contract'taki status
  blockNumber: number;          // Blockchain block number
  transactionHash: string;      // Transaction hash
}

// Slippage update entity - Smart contract ile uyumlu
export interface SlippageUpdate extends BaseEntity {
  restaurant: string;           // Restaurant wallet address
  itemName?: string;            // Optional item name
  slippageBps: number;          // Slippage in basis points
  blockNumber: number;          // Blockchain block number
  transactionHash: string;      // Transaction hash
}

// Payment entity - Smart contract ile uyumlu
export interface Payment extends BaseEntity {
  customer: string;             // Customer wallet address
  orderId: number;              // Order ID
  amount: number;               // Payment amount
  blockNumber: number;          // Blockchain block number
  transactionHash: string;      // Transaction hash
}

// Refund entity - Smart contract ile uyumlu
export interface Refund extends BaseEntity {
  customer: string;             // Customer wallet address
  orderId: number;              // Order ID
  amount: number;               // Refund amount
  blockNumber: number;          // Blockchain block number
  transactionHash: string;      // Transaction hash
}

// Price update entity - Smart contract ile uyumlu
export interface PriceUpdate extends BaseEntity {
  itemName: string;             // Smart contract'taki itemName
  oldPrice: number;             // Smart contract'taki oldPrice
  newPrice: number;             // Smart contract'taki newPrice
  blockNumber: number;          // Blockchain block number
  transactionHash: string;      // Transaction hash
}

// Token transfer entity - Smart contract ile uyumlu
export interface TokenTransfer extends BaseEntity {
  from: string;                 // From address
  to: string;                   // To address
  value: number;                // Transfer value
  blockNumber: number;          // Blockchain block number
  transactionHash: string;      // Transaction hash
}

// User role enum - Güvenlik için
export enum UserRole {
  CUSTOMER = 'customer',
  RESTAURANT = 'restaurant',
  OWNER = 'owner'
}

// User entity - Güvenlik için
export interface User extends BaseEntity {
  walletAddress: string;        // Wallet address
  role: UserRole;               // User role
  isActive: boolean;            // Is user active
  lastLogin?: Date;             // Last login time
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter types
export interface Filters {
  [key: string]: any;
}
