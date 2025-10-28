import type { Restaurant, Customer, Order, MenuItem, PriceUpdate } from '../types';

// Backend API Configuration
const BACKEND_BASE_URL = 'http://localhost:4000';
const API_KEY = 'yemeksepeti_secure_api_key_2025';

// API Headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
});

// Generic API call function
async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${BACKEND_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Health Check
export async function checkBackendHealth(): Promise<{ status: string; timestamp: string }> {
  return apiCall('/health');
}

// Data Endpoints
export async function fetchCustomersFromBackend(
  page: number = 1, 
  limit: number = 20, 
  search?: string
): Promise<{ data: Customer[]; pagination: any }> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  
  return apiCall(`/api/data/customers?${params}`);
}

export async function fetchRestaurantsFromBackend(
  page: number = 1, 
  limit: number = 20, 
  search?: string
): Promise<{ data: Restaurant[]; pagination: any }> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  
  return apiCall(`/api/data/restaurants?${params}`);
}

export async function fetchOrdersFromBackend(
  page: number = 1, 
  limit: number = 20, 
  search?: string
): Promise<{ data: Order[]; pagination: any }> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  
  return apiCall(`/api/data/orders?${params}`);
}

// Data Sync
export async function syncDataFromSubgraph(type: 'all' | 'customers' | 'restaurants' | 'menuItems' | 'orders' = 'all'): Promise<void> {
  return apiCall('/api/data/sync', {
    method: 'POST',
    body: JSON.stringify({ type }),
  });
}

// Stats
export async function getBackendStats(): Promise<any> {
  return apiCall('/api/data/stats');
}

// Oracle Endpoints
export async function getCurrentEthPrice(): Promise<PriceUpdate> {
  return apiCall('/api/oracle/eth-price');
}

export async function updateEthPrice(priceUSD: number, source: string): Promise<void> {
  return apiCall('/api/oracle/update-eth-price', {
    method: 'POST',
    body: JSON.stringify({ priceUSD, source }),
  });
}

export async function updateTokenPrice(
  tokenAddress: string, 
  priceUSD: number, 
  source: string
): Promise<void> {
  return apiCall('/api/oracle/update-token-price', {
    method: 'POST',
    body: JSON.stringify({ tokenAddress, priceUSD, source }),
  });
}

export async function batchUpdatePrices(updates: Array<{
  tokenAddress?: string;
  priceUSD: number;
  source: string;
}>): Promise<void> {
  return apiCall('/api/oracle/batch-update-prices', {
    method: 'POST',
    body: JSON.stringify({ updates }),
  });
}

// Auth Health
export async function checkAuthHealth(): Promise<any> {
  return apiCall('/api/auth/health');
}
