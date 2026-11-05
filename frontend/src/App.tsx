import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './experience.css';
import Header from './components/Header';
import RestaurantCard from './components/RestaurantCard';
import RestaurantMenu from './components/RestaurantMenu';
import CartDrawer from './components/CartDrawer';
import RestaurantPanel from './components/RestaurantPanel';
import { CartProvider, useCart } from './context/CartContext';
import { ToastProvider } from './components/ToastProvider';
import { fetchRestaurantCatalog } from './lib/api';
import type { Restaurant } from './types';

type CatalogSource = 'graphql' | 'sample';

const AppBody: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [source, setSource] = useState<CatalogSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => new URLSearchParams(window.location.search).get('restaurant')
  );
  const [showRestaurantPanel, setShowRestaurantPanel] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tümü');
  const [sort, setSort] = useState<'recommended' | 'rating' | 'delivery'>('recommended');
  const { lines, activeRestaurantId } = useCart();

  const loadCatalog = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const catalog = await fetchRestaurantCatalog();
      setRestaurants(catalog.restaurants);
      setSource(catalog.source);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadCatalog(); }, []);

  useEffect(() => {
    const handleBack = () => {
      setSelectedId(new URLSearchParams(window.location.search).get('restaurant'));
      setShowRestaurantPanel(false);
    };
    window.addEventListener('popstate', handleBack);
    return () => window.removeEventListener('popstate', handleBack);
  }, []);

  const openRestaurant = (id: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('restaurant', id);
    window.history.pushState({}, '', window.location.pathname + '?' + params.toString());
    setSelectedId(id);
    setShowRestaurantPanel(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const goHome = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('restaurant');
    window.history.pushState({}, '', window.location.pathname + (params.toString() ? '?' + params : ''));
    setSelectedId(null);
    setShowRestaurantPanel(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const selected = restaurants.find(restaurant => restaurant.id === selectedId) ?? null;
  const cartCount = lines.reduce((count, line) => count + line.qty, 0);
  const cartRestaurant = restaurants.find(restaurant => restaurant.id === activeRestaurantId);
  // Contract addresses must always come from walletAddress, never the physical address.
  const checkoutRestaurantWallet = source === 'graphql' ? (cartRestaurant?.walletAddress ?? null) : null;

  const categories = useMemo(() => {
    const all = new Set(restaurants.flatMap(item => item.categories ?? []));
    return ['Tümü', ...Array.from(all).slice(0, 9)];
  }, [restaurants]);

  const filtered = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase('tr-TR');
    const matches = restaurants.filter(restaurant => {
      const searchable = [restaurant.name, restaurant.address ?? '', ...(restaurant.categories ?? []), ...((restaurant.menu ?? []).map(item => item.name))];
      return (category === 'Tümü' || restaurant.categories?.includes(category)) &&
        (!normalized || searchable.some(value => value.toLocaleLowerCase('tr-TR').includes(normalized)));
    });
    return [...matches].sort((a, b) => {
      if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
      if (sort === 'delivery') return (parseInt(a.eta ?? '999', 10) || 999) - (parseInt(b.eta ?? '999', 10) || 999);
      return 0;
    });
  }, [restaurants, search, category, sort]);

  return (
    <div className="app nx-app">
      <a className="nx-skip-link" href="#main-content">İçeriğe geç</a>
      <Header
        onHome={goHome}
        onRestaurantPanel={() => { setSelectedId(null); setShowRestaurantPanel(true); }}
        onCartClick={() => setCartOpen(true)}
        cartCount={cartCount}
        isPanel={showRestaurantPanel}
      />
      <main id="main-content">
        {showRestaurantPanel ? (
          <section className="nx-shell nx-panel-shell">
            <div className="nx-section-heading">
              <div><div className="nx-eyebrow">MERCHANT SPACE</div><h1>Restoran yönetimi</h1><p>Siparişlerini ve on-chain işlemlerini tek yerden yönet.</p></div>
              <button type="button" className="nx-button nx-button-secondary" onClick={goHome}>← Restoranlara dön</button>
            </div>
            <RestaurantPanel />
          </section>
        ) : selected ? (
          <RestaurantMenu restaurant={selected} onBack={goHome} />
        ) : (
          <>
            <section className="nx-hero">
              <div className="nx-shell nx-hero-layout">
                <div className="nx-hero-content">
                  <div className="nx-hero-kicker"><span className="nx-sparkle">✦</span> YENİ NESİL YEMEK DENEYİMİ</div>
                  <h1>Güzel bir yemek.<br/><em>Akıllı bir ödeme.</em></h1>
                  <p>Sevdiğin lezzetleri keşfet, sepetini oluştur ve dilersen kripto cüzdanınla güvenle sipariş ver.</p>
                  <a className="nx-button nx-button-primary nx-hero-cta" href="#restaurants">Restoranları keşfet <span aria-hidden="true">↗</span></a>
                  <div className="nx-hero-metrics">
                    <span><strong>{restaurants.length || '—'}</strong> restoran</span>
                    <span className="nx-hero-divider" aria-hidden="true"/>
                    <span><strong>ETH + FOOD</strong> ödeme seçeneği</span>
                  </div>
                </div>
                <div className="nx-hero-art" aria-hidden="true">
                  <div className="nx-art-glow"/>
                  <div className="nx-art-orbit orbit-one"/>
                  <div className="nx-art-orbit orbit-two"/>
                  <div className="nx-art-card"><div className="nx-art-food">🍜</div><span>THE GOOD FOOD CLUB</span></div>
                  <div className="nx-art-note nx-art-note-top">✦ &nbsp; Good taste, on-chain</div>
                  <div className="nx-art-note nx-art-note-bottom">◈ &nbsp; Built with Web3</div>
                </div>
              </div>
            </section>

            <div className="nx-shell nx-catalog">
              {source === 'sample' && (
                <div role="status" className="nx-demo-alert"><span aria-hidden="true">ⓘ</span><div><strong>Demo kataloğu gösteriliyor.</strong> Canlı servis kullanılabilir değil. Örnek restoranlar gerçek on-chain sipariş anlamına gelmez; ödeme öncesi kayıt ve ağ doğrulanır.</div></div>
              )}
              <section id="restaurants" aria-labelledby="restaurants-title">
                <div className="nx-section-heading nx-catalog-heading">
                  <div><div className="nx-eyebrow nx-orange">SENİN İÇİN SEÇTİK</div><h2 id="restaurants-title">Bugün ne yesek?</h2><p>Favori lezzetini bul, birkaç tıkla sepetine ekle.</p></div>
                  <div className="nx-count-label">{filtered.length} restoran gösteriliyor</div>
                </div>
                <div className="nx-toolbar">
                  <label className="nx-search">
                    <span className="nx-search-icon" aria-hidden="true">⌕</span>
                    <span className="nx-sr-only">Restoran veya yemek ara</span>
                    <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Restoran, yemek veya mutfak ara…" autoComplete="off" />
                  </label>
                  <label className="nx-sort"><span>Sırala</span>
                    <select value={sort} onChange={event => setSort(event.target.value as typeof sort)} aria-label="Restoranları sırala">
                      <option value="recommended">Önerilen</option><option value="rating">En yüksek puan</option><option value="delivery">En hızlı teslimat</option>
                    </select>
                  </label>
                </div>
                <div className="nx-category-row" aria-label="Mutfak kategorileri">
                  {categories.map(name => <button key={name} type="button" aria-pressed={category === name} className={'nx-chip' + (category === name ? ' active' : '')} onClick={() => setCategory(name)}>{name}</button>)}
                </div>

                {isLoading ? (
                  <div className="nx-restaurant-grid" aria-label="Restoranlar yükleniyor">
                    {[1, 2, 3, 4].map(n => <div className="nx-skeleton-card" key={n}><div className="nx-skeleton-media"/><div className="nx-skeleton-line"/><div className="nx-skeleton-line short"/></div>)}
                  </div>
                ) : loadError ? (
                  <div className="nx-empty-state"><div className="nx-empty-illustration">⚠</div><h3>Restoranlara ulaşılamadı</h3><p>Bağlantıyı kontrol edip yeniden deneyebilirsin.</p><button className="nx-button nx-button-primary" onClick={() => void loadCatalog()}>Tekrar dene</button></div>
                ) : filtered.length ? (
                  <div className="nx-restaurant-grid">{filtered.map(restaurant => <RestaurantCard key={restaurant.id} data={restaurant} onOpen={openRestaurant}/>)}</div>
                ) : (
                  <div className="nx-empty-state"><div className="nx-empty-illustration">⌕</div><h3>Aradığını bulamadık</h3><p>Başka bir yemek veya kategori deneyebilirsin.</p><button type="button" className="nx-button nx-button-secondary" onClick={() => { setSearch(''); setCategory('Tümü'); }}>Filtreleri temizle</button></div>
                )}
              </section>
              <section className="nx-merchant-promo">
                <div><div className="nx-eyebrow">RESTORANLAR İÇİN</div><h2>Mutfağın senin, kontrol de senin.</h2><p>Siparişleri takip et, ödemeleri görüntüle ve restoranını tek panelden yönet.</p></div>
                <button type="button" className="nx-button nx-button-ivory" onClick={() => setShowRestaurantPanel(true)}>Restoran paneli <span aria-hidden="true">↗</span></button>
              </section>
            </div>
          </>
        )}
      </main>
      <footer className="nx-footer"><div className="nx-shell nx-footer-inner"><span className="nx-footer-brand">✦ YemekSepeti <small>dApp</small></span><span>Yemeğin yeni nesil hali. · Web3 deneysel uygulama</span><span>© 2026</span></div></footer>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} restaurantAddr={checkoutRestaurantWallet} />
    </div>
  );
};

const App: React.FC = () => <CartProvider><ToastProvider><AppBody /></ToastProvider></CartProvider>;
export default App;
