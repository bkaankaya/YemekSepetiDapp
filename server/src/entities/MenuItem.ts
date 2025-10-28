import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Restaurant } from './Restaurant.js';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Restaurant, restaurant => restaurant.menuItems)
  restaurant: Restaurant;

  @Column('decimal', { precision: 18, scale: 6 })
  priceQuote: number;

  @Column()
  priceQuoteDecimals: number;

  @Column('simple-array')
  acceptedTokens: string[];
}
