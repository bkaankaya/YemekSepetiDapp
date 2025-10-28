import React from 'react';
import type { Restaurant } from '../types';
import RestaurantCard from './RestaurantCard';

const RestaurantList: React.FC<{
  items: Restaurant[];
  onOpen: (id: string) => void;
}> = ({ items, onOpen }) => {
  return (
    <>
      {items.map(r => <RestaurantCard key={r.id} data={r} onOpen={onOpen} />)}
    </>
  );
};

export default RestaurantList;
