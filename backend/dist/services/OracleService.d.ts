import { OraclePriceUpdate, OraclePrice } from '../types/index.js';
export declare class OracleService {
    private provider;
    private wallet;
    private oracleContract;
    private priceUpdateRepository;
    constructor();
    private getOracleABI;
    updateEthPrice(priceUSD: number, source?: string): Promise<boolean>;
    updateTokenPrice(tokenAddress: string, priceUSD: number, source?: string): Promise<boolean>;
    batchUpdatePrices(updates: OraclePriceUpdate[]): Promise<boolean[]>;
    getCurrentEthPrice(): Promise<OraclePrice>;
    getCurrentTokenPrice(tokenAddress: string): Promise<OraclePrice>;
    updatePricesFromExternalSource(): Promise<void>;
    private fetchEthPriceFromCoinGecko;
    private fetchEthPriceFromBinance;
    private savePriceUpdate;
    private generateId;
    checkOracleHealth(): Promise<boolean>;
    estimateGasForEthPriceUpdate(priceUSD: number): Promise<string>;
}
//# sourceMappingURL=OracleService.d.ts.map