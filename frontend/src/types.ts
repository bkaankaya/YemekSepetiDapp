export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  priceUSD: number;
  category?: string;
};

export type Restaurant = {
  id: string;
  name: string;
  walletAddress?: string;
  logo?: string;
  categories?: string[];
  rating?: number;
  eta?: string;
  address?: string; // physical address; never use this for blockchain transfers
  menu: MenuItem[];
};

export type CartLine = { restaurantId: string; item: MenuItem; qty: number };

// Shared API response models. Keep in sync with backend fields, not contract ABIs.
export type Customer = { id: string; walletAddress?: string; name?: string; email?: string; [key: string]: unknown };
export type Order = { id: string; status?: string; restaurant?: string; customer?: string; [key: string]: unknown };
export type PriceUpdate = { id?: string; priceUSD?: number; tokenAddress?: string; timestamp?: number; [key: string]: unknown };
