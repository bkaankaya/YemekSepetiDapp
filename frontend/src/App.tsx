import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Header from './components/Header';
import RestaurantList from './components/RestaurantList';
import RestaurantMenu from './components/RestaurantMenu';
import CartDrawer from './components/CartDrawer';
import RestaurantPanel from './components/RestaurantPanel';
import { CartProvider, useCart } from './context/CartContext';
import { ToastProvider } from './components/ToastProvider';
import { fetchRestaurant, fetchRestaurants } from './lib/api';
import type { Restaurant } from './types';
import { RESTAURANT_ADDR } from './lib/onchain';

const AppBody: React.FC = () => {
  const [all, setAll] = useState<Restaurant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [showRestaurantPanel, setShowRestaurantPanel] = useState(false);
  const { lines } = useCart();

  useEffect(() => { fetchRestaurants().then(setAll); }, []);
  useEffect(() => {
    if (!selectedId) { setSelected(null); return; }
    fetchRestaurant(selectedId).then(setSelected);
  }, [selectedId]);

  const cartCount = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);

  return (
    <div className="app">
      <Header onCartClick={() => setCartOpen(true)} cartCount={cartCount} />

      {/* Ana menü */}
      {!selected && !showRestaurantPanel && (
        <div className="main-container">
          <div className="restaurant-list-container">
            {/* Sayfa Başlığı */}
            <div className="page-title">
              <h1>🍽️ Lezzetli Restoranlar</h1>
              <p>En sevdiğiniz yemekleri sipariş edin, hızlı teslimat ile kapınıza gelsin!</p>
            </div>
            
            {/* Restoran Listesi */}
            <div className="restaurant-grid">
              <RestaurantList items={all} onOpen={(id) => setSelectedId(id)} />
            </div>
            
            {/* Restoran Paneli Butonu */}
            <div className="restaurant-panel-section">
              <h2 className="restaurant-panel-title">Restoran Sahibi misiniz?</h2>
              <p className="restaurant-panel-description">
                Restoranınızı platformumuza ekleyin ve müşterilerinize ulaşın. 
                Kolay yönetim paneli ile siparişlerinizi takip edin.
              </p>
              <button
                className="restaurant-panel-btn"
                onClick={() => setShowRestaurantPanel(true)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                🏪 Restoran Paneli
              </button>
            </div>


          </div>
        </div>
      )}

      {/* Restoran menüsü */}
      {selected && !showRestaurantPanel && (
        <RestaurantMenu
          restaurant={selected}
          onBack={() => setSelectedId(null)}
        />
      )}

      {/* Restoran paneli */}
      {showRestaurantPanel && (
        <div>
          <button
            onClick={() => setShowRestaurantPanel(false)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "4px",
              margin: "20px",
              cursor: "pointer"
            }}
          >
            ← Ana Menüye Dön
          </button>
          <RestaurantPanel />
        </div>
      )}



      <CartDrawer 
        open={cartOpen} 
        onClose={() => setCartOpen(false)}
        restaurantAddr={(selected?.address || RESTAURANT_ADDR) as `0x${string}`}
      />
    </div>
  );
};

const App: React.FC = () => (
  <CartProvider>
    <ToastProvider>
      <AppBody />
    </ToastProvider>
  </CartProvider>
);

export default App;
