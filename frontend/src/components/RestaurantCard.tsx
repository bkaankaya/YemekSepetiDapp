import React from 'react';
import type { Restaurant } from '../types';

const visualFor = (restaurant: Restaurant) => {
  // Prefer the restaurant's primary category; secondary categories must not override its cuisine.
  const term = [restaurant.name, restaurant.categories?.[0] ?? ''].join(' ').toLocaleLowerCase('tr-TR');
  if (/pizza/.test(term)) return {emoji:'🍕', theme:'pizza', label:'Pizza'};
  if (/burger/.test(term)) return {emoji:'🍔', theme:'burger', label:'Burger'};
  if (/kebap|ızgara|izgara/.test(term)) return {emoji:'🍢', theme:'kebap', label:'Kebap'};
  if (/sushi|ramen/.test(term)) return {emoji:'🍣', theme:'sushi', label:'Sushi'};
  if (/tatlı|tatli|baklava/.test(term)) return {emoji:'🍰', theme:'dessert', label:'Tatlı'};
  if (/kahve|coffee/.test(term)) return {emoji:'☕', theme:'coffee', label:'Kahve'};
  if (/tavuk|chicken/.test(term)) return {emoji:'🍗', theme:'chicken', label:'Tavuk'};
  return {emoji:'🍝', theme:'pasta', label:'Lezzet'};
};

const RestaurantCard: React.FC<{ data: Restaurant; onOpen: (id: string) => void }> = ({data,onOpen}) => {
  const visual = visualFor(data);
  return <article className="nx-restaurant-card">
    <button type="button" className="nx-restaurant-hit" onClick={() => onOpen(data.id)} aria-label={data.name + ' menüsünü gör'}>
      <div className={'nx-restaurant-media nx-media-' + visual.theme}>
        <span className="nx-media-watermark" aria-hidden="true">✳</span>
        <span className="nx-food-emoji" aria-hidden="true">{visual.emoji}</span>
        <span className="nx-image-label">{visual.label}</span>
      </div>
      <div className="nx-restaurant-body">
        <div className="nx-restaurant-title-row"><h3>{data.name}</h3><span className="nx-arrow" aria-hidden="true">↗</span></div>
        <p className="nx-restaurant-cuisine">{data.categories?.slice(0,3).join(' · ') || data.address || 'On-chain restoran'}</p>
        <div className="nx-restaurant-meta">
          <span><span className="nx-star" aria-hidden="true">★</span> {data.rating?.toFixed(1) ?? 'Yeni'}</span>
          <span className="nx-meta-separator" aria-hidden="true">·</span>
          <span><span aria-hidden="true">◷</span> {data.eta ?? 'Süre belirtilmedi'}</span>
        </div>
      </div>
    </button>
  </article>;
};
export default RestaurantCard;
