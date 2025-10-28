import React, { createContext, useContext, useMemo, useState } from 'react';
import type { CartLine, MenuItem } from '../types';

type CartCtx = {
  lines: CartLine[];
  add: (restaurantId: string, item: MenuItem) => void;
  inc: (itemId: string) => void;
  dec: (itemId: string) => void;
  remove: (itemId: string) => void;
  clear: () => void;
  totalUSD: number;
  activeRestaurantId: string | null; // aynı anda tek restorandan sipariş
};

const Context = createContext<CartCtx | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lines, setLines] = useState<CartLine[]>([]);
  const activeRestaurantId = lines[0]?.restaurantId ?? null;

  const add = (restaurantId: string, item: MenuItem) => {
    setLines(prev => {
      // Sepette başka restoran varsa temizleyelim (Yemeksepeti davranışı)
      const base = prev.length && prev[0].restaurantId !== restaurantId ? [] : prev;
      const idx = base.findIndex(l => l.item.id === item.id);
      if (idx === -1) return [...base, { restaurantId, item, qty: 1 }];
      const copy = [...base]; copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 }; return copy;
    });
  };

  const inc = (itemId: string) => setLines(prev => prev.map(l => l.item.id === itemId ? { ...l, qty: l.qty + 1 } : l));
  const dec = (itemId: string) => setLines(prev => prev
    .map(l => l.item.id === itemId ? { ...l, qty: l.qty - 1 } : l)
    .filter(l => l.qty > 0));
  const remove = (itemId: string) => setLines(prev => prev.filter(l => l.item.id !== itemId));
  const clear = () => setLines([]);

  const totalUSD = useMemo(() => lines.reduce((s, l) => s + l.item.priceUSD * l.qty, 0), [lines]);

  return (
    <Context.Provider value={{ lines, add, inc, dec, remove, clear, totalUSD, activeRestaurantId }}>
      {children}
    </Context.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
