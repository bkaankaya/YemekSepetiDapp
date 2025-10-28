import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('price_updates')
export class PriceUpdate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  itemName: string;

  @Column('decimal', { precision: 18, scale: 6 })
  oldPrice: number;

  @Column('decimal', { precision: 18, scale: 6 })
  newPrice: number;

  @Column()
  blockNumber: string;

  @Column()
  transactionHash: string;

  @CreateDateColumn()
  timestamp: Date;
}
