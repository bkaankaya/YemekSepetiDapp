import React from 'react';
import type { Restaurant } from '../types';

const RestaurantCard: React.FC<{ data: Restaurant; onOpen: (id: string) => void }> = ({ data, onOpen }) => {
  return (
    <div className="restaurant-card" onClick={() => onOpen(data.id)}>
      <div className="restaurant-header">
        <div className="restaurant-logo">
          🍽️
        </div>
        <div className="restaurant-info">
          <h3 className="restaurant-name">{data.name}</h3>
          <div className="restaurant-meta">
            <div className="restaurant-rating">
              ⭐ {data.rating?.toFixed(1) ?? '—'}
            </div>
            <div className="restaurant-delivery">
              🚚 {data.eta ?? '—'}
            </div>
          </div>
          <div className="restaurant-categories">
            {data.categories?.length ? data.categories.join(' • ') : 'Çeşitli yemekler'}
          </div>
        </div>
      </div>
      <div className="restaurant-actions">
        <button className="view-menu-btn">Menüyü Gör</button>
      </div>
    </div>
  );
};

export default RestaurantCard;
