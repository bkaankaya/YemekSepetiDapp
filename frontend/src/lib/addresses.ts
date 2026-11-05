import {YEMEKSEPETI_ADDRESS,ESCROW_ADDRESS,ORACLE_ADDRESS,FOOD_ADDRESS} from './contracts';
/** Single source of truth for deployed local contract addresses. */
export const ADDRS={YEMEKSEPETI:YEMEKSEPETI_ADDRESS,ESCROW:ESCROW_ADDRESS,ORACLE:ORACLE_ADDRESS,FOOD:FOOD_ADDRESS} as const;
