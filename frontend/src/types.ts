export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  priceUSD: number;      // basit tutuyoruz; kontrata bağlayınca wei/decimals ekleriz
  category?: string;
};

export type Restaurant = {
  id: string;
  name: string;
  walletAddress?: string; // Blockchain cüzdan adresi
  logo?: string;
  categories?: string[];
  rating?: number;       // 1–5
  eta?: string;          // örn: "25-35 dk"
  address?: string;      // gerçek adres (isteğe bağlı)
  menu: MenuItem[];
};

export type CartLine = {
  restaurantId: string;
  item: MenuItem;
  qty: number;
};
