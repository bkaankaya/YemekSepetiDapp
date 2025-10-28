import React, { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import type { Restaurant } from '../types';

const RestaurantMenu: React.FC<{
  restaurant: Restaurant;
  onBack: () => void;
}> = ({ restaurant, onBack }) => {
  const { add, activeRestaurantId } = useCart();
  const [query, setQuery] = useState('');

  const items = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return restaurant.menu;
    return restaurant.menu.filter(i =>
      i.name.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q)); //Arama algoritması burada çalışıyor
  }, [query, restaurant.menu]);

  const byCategory = useMemo(() => {
    const map: Record<string, typeof items> = {};
    items.forEach(i => {
      const k = i.category ?? 'Diğer';
      (map[k] ||= []).push(i);
    });
    return map;
  }, [items]);

  const switching = activeRestaurantId && activeRestaurantId !== restaurant.id;

  return (
    <section className="menu-wrap">
      <div className="menu-header">
        <div className="menu-header-left">
          <button className="back-btn" onClick={onBack}>
            ← Restoranlar
          </button>
        </div>
        
        <div className="menu-header-center">
          <h2 className="restaurant-title">{restaurant.name}</h2>
          <div className="restaurant-subtitle">Lezzetli menü seçenekleri</div>
        </div>
        
        <div className="menu-header-right">
          <div className="search-container">
            <input
              className="search"
              placeholder="Ara: pizza, kebap, içecek..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {Object.entries(byCategory).map(([cat, list]) => (
        <div key={cat} className="menu-cat">
          <h3 className="menu-category-title">{cat}</h3>
          <div className="menu-grid">
            {list.map(mi => (
              <div key={mi.id} className="menu-item">
                <div className="mi-main">
                  <div>
                    <div className="mi-name">{mi.name}</div>
                    {mi.description && <div className="mi-desc">{mi.description}</div>}
                  </div>
                  <div className="mi-price">${mi.priceUSD.toFixed(2)}</div>
                </div>
                <button
                  className="add-btn"
                  title={switching ? 'Sepette başka restoran var; ekleyince sepet sıfırlanır' : 'Ekle'}
                  onClick={() => add(restaurant.id, mi)}
                >
                  Sepete Ekle
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default RestaurantMenu;
