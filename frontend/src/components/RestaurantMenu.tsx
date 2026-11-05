import React, { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from './ToastProvider';
import type { Restaurant } from '../types';

const RestaurantMenu: React.FC<{ restaurant: Restaurant; onBack: () => void }> = ({ restaurant, onBack }) => {
  const { add, activeRestaurantId } = useCart();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const categories = useMemo(() => ['Tümü', ...Array.from(new Set((restaurant.menu ?? []).map(item => item.category ?? 'Diğer')))], [restaurant.menu]);
  const items = useMemo(() => (restaurant.menu ?? []).filter(item => (
    (activeCategory === 'Tümü' || (item.category ?? 'Diğer') === activeCategory) &&
    (!query.trim() || [item.name,item.description ?? ''].some(value => value.toLocaleLowerCase('tr-TR').includes(query.trim().toLocaleLowerCase('tr-TR'))))
  )), [restaurant.menu, query, activeCategory]);

  const addToCart = (item: typeof items[number]) => {
    if (activeRestaurantId && activeRestaurantId !== restaurant.id &&
      !window.confirm('Sepetinde başka restorandan ürünler var. Sepetini temizleyip bu restorandan devam etmek istiyor musun?')) return;
    add(restaurant.id, item);
    showToast(item.name + ' sepete eklendi', 'success', 2600);
  };

  return <div className="nx-shell nx-menu-page">
    <button type="button" className="nx-back-link" onClick={onBack}><span aria-hidden="true">←</span> Tüm restoranlar</button>
    <section className="nx-menu-banner">
      <div><div className="nx-hero-kicker">RESTORAN MENÜSÜ</div><h1>{restaurant.name}</h1><p>{restaurant.categories?.slice(0,4).join(' · ') || restaurant.address || 'On-chain restoran'}</p>
        <div className="nx-menu-badges"><span>★ {restaurant.rating?.toFixed(1) ?? 'Yeni'}</span><span>◷ {restaurant.eta ?? 'Teslimat süresi belirtilmedi'}</span></div>
      </div><div className="nx-menu-hero-food" aria-hidden="true">🍽️</div>
    </section>
    <section className="nx-menu-content" aria-labelledby="menu-heading">
      <div className="nx-section-heading"><div><div className="nx-eyebrow nx-orange">ÖZENLE HAZIRLANDI</div><h2 id="menu-heading">Menüyü keşfet</h2><p>Ne canın çekiyorsa burada.</p></div><span className="nx-count-label">{items.length} ürün</span></div>
      <div className="nx-toolbar"><label className="nx-search"><span className="nx-search-icon" aria-hidden="true">⌕</span><span className="nx-sr-only">Menüde ürün ara</span><input placeholder="Menüde yemek ara…" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
      <div className="nx-category-row" aria-label="Menü kategorileri">{categories.map(category => <button type="button" key={category} aria-pressed={activeCategory === category} className={'nx-chip' + (activeCategory === category ? ' active' : '')} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>
      {items.length ? <div className="nx-menu-items">{items.map(item => <article className="nx-menu-item" key={item.id}><div className="nx-menu-item-icon" aria-hidden="true">✦</div><div className="nx-menu-item-info"><h3>{item.name}</h3><p>{item.description || 'Taze ve özenle hazırlanır.'}</p><strong>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(item.priceUSD)}</strong></div><button type="button" className="nx-add-button" onClick={() => addToCart(item)} aria-label={item.name + ' sepete ekle'}>+ <span>Ekle</span></button></article>)}</div> : <div className="nx-empty-state"><h3>Bu kategoride ürün bulunamadı</h3><button className="nx-button nx-button-secondary" onClick={() => {setQuery('');setActiveCategory('Tümü');}}>Tüm ürünleri göster</button></div>}
    </section>
  </div>;
};
export default RestaurantMenu;
