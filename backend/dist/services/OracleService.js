import { ethers } from 'ethers';
import { logger } from '../utils/logger.js';
import { PriceUpdateRepository } from '../data/repositories/PriceUpdateRepository.js';
import { LOG_MESSAGES } from '../constants/index.js';
export class OracleService {
    constructor() {
        this.priceUpdateRepository = new PriceUpdateRepository();
        const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
        const privateKey = process.env.ADMIN_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000';
        const oracleAddress = process.env.ORACLE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
        // Development modunda contract bağlantısını atla
        if (process.env.NODE_ENV === 'development' &&
            (privateKey === '0x0000000000000000000000000000000000000000000000000000000000000000' ||
                oracleAddress === '0x0000000000000000000000000000000000000000')) {
            logger.warn('Oracle contract adresi bulunamadı - development modunda çalışılıyor');
            this.provider = null;
            this.wallet = null;
            this.oracleContract = null;
        }
        else {
            try {
                this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
                this.wallet = new ethers.Wallet(privateKey, this.provider);
                this.oracleContract = new ethers.Contract(oracleAddress, this.getOracleABI(), this.wallet);
            }
            catch (error) {
                logger.warn('Oracle contract başlatılamadı - development modunda çalışılıyor', { error: error.message });
                this.provider = null;
                this.wallet = null;
                this.oracleContract = null;
            }
        }
        logger.info('OracleService başlatıldı', {
            rpcUrl,
            oracleAddress,
            mode: this.oracleContract ? 'production' : 'development'
        });
    }
    // Oracle ABI - Oracle.sol contract'ından
    getOracleABI() {
        return [
            'function setEthPrice(uint256 _price) external',
            'function setTokenPrice(address _token, uint256 _price) external',
            'function currentEthPriceE18() external view returns (uint256)',
            'function currentTokenPriceE18(address _token) external view returns (uint256)',
            'function grantFeeder(address _feeder) external',
            'event EthPriceUpdated(uint256 oldPrice, uint256 newPrice, uint256 timestamp)',
            'event TokenPriceUpdated(address indexed token, uint256 oldPrice, uint256 newPrice, uint256 timestamp)'
        ];
    }
    // ETH fiyatını güncelle
    async updateEthPrice(priceUSD, source = 'backend') {
        try {
            logger.info(LOG_MESSAGES.ORACLE_UPDATE_STARTED, { priceUSD, source });
            // Development modunda sadece veritabanına kaydet
            if (!this.oracleContract || !this.wallet) {
                logger.warn('Oracle contract bulunamadı - sadece veritabanına kaydediliyor');
                await this.savePriceUpdate({
                    tokenAddress: undefined,
                    oldPrice: 0,
                    newPrice: priceUSD,
                    priceUSD,
                    source,
                    updatedBy: 'development_mode'
                });
                logger.info('ETH fiyatı development modunda kaydedildi', { priceUSD });
                return true;
            }
            // Mevcut fiyatı al
            const currentPrice = await this.getCurrentEthPrice();
            // Fiyatı E18 formatına çevir (USD * 10^18)
            const priceE18 = ethers.utils.parseUnits(priceUSD.toString(), 18);
            // Smart contract'ı çağır
            const tx = await this.oracleContract.setEthPrice(priceE18);
            await tx.wait();
            // Veritabanına kaydet
            await this.savePriceUpdate({
                tokenAddress: undefined,
                oldPrice: currentPrice.priceUSD,
                newPrice: priceUSD,
                priceUSD,
                source,
                updatedBy: this.wallet.address
            });
            logger.info(LOG_MESSAGES.ORACLE_UPDATE_COMPLETED, {
                priceUSD,
                txHash: tx.hash,
                gasUsed: tx.gasLimit?.toString()
            });
            return true;
        }
        catch (error) {
            logger.error(LOG_MESSAGES.ORACLE_UPDATE_ERROR, { error: error.message, priceUSD });
            throw error;
        }
    }
    // Token fiyatını güncelle
    async updateTokenPrice(tokenAddress, priceUSD, source = 'backend') {
        try {
            logger.info(LOG_MESSAGES.ORACLE_UPDATE_STARTED, { tokenAddress, priceUSD, source });
            // Development modunda sadece veritabanına kaydet
            if (!this.oracleContract || !this.wallet) {
                logger.warn('Oracle contract bulunamadı - sadece veritabanına kaydediliyor');
                await this.savePriceUpdate({
                    tokenAddress,
                    oldPrice: 0,
                    newPrice: priceUSD,
                    priceUSD,
                    source,
                    updatedBy: 'development_mode'
                });
                logger.info('Token fiyatı development modunda kaydedildi', { tokenAddress, priceUSD });
                return true;
            }
            // Mevcut fiyatı al
            const currentPrice = await this.getCurrentTokenPrice(tokenAddress);
            // Fiyatı E18 formatına çevir
            const priceE18 = ethers.utils.parseUnits(priceUSD.toString(), 18);
            // Smart contract'ı çağır
            const tx = await this.oracleContract.setTokenPrice(tokenAddress, priceE18);
            await tx.wait();
            // Veritabanına kaydet
            await this.savePriceUpdate({
                tokenAddress,
                oldPrice: currentPrice.priceUSD,
                newPrice: priceUSD,
                priceUSD,
                source,
                updatedBy: this.wallet.address
            });
            logger.info(LOG_MESSAGES.ORACLE_UPDATE_COMPLETED, {
                tokenAddress,
                priceUSD,
                txHash: tx.hash
            });
            return true;
        }
        catch (error) {
            logger.error(LOG_MESSAGES.ORACLE_UPDATE_ERROR, {
                error: error.message,
                tokenAddress,
                priceUSD
            });
            throw error;
        }
    }
    // Toplu fiyat güncellemesi
    async batchUpdatePrices(updates) {
        logger.info('Toplu fiyat güncellemesi başlatıldı', { count: updates.length });
        const results = await Promise.allSettled(updates.map(async (update) => {
            if (update.tokenAddress) {
                return this.updateTokenPrice(update.tokenAddress, update.priceUSD, update.source);
            }
            else {
                return this.updateEthPrice(update.priceUSD, update.source);
            }
        }));
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        logger.info('Toplu fiyat güncellemesi tamamlandı', {
            total: updates.length,
            success: successCount,
            failed: updates.length - successCount
        });
        return results.map(r => r.status === 'fulfilled' ? r.value : false);
    }
    // Mevcut ETH fiyatını al
    async getCurrentEthPrice() {
        try {
            if (!this.oracleContract) {
                logger.warn('Oracle contract bulunamadı - varsayılan ETH fiyatı döndürülüyor');
                return {
                    priceUSD: 2000, // Varsayılan ETH fiyatı
                    priceE18: '2000000000000000000000',
                    lastUpdated: new Date().toISOString(),
                    source: 'development'
                };
            }
            const priceE18 = await this.oracleContract.currentEthPriceE18();
            const priceUSD = parseFloat(ethers.utils.formatUnits(priceE18, 18));
            return {
                priceUSD,
                priceE18: priceE18.toString(),
                lastUpdated: new Date().toISOString(),
                source: 'oracle'
            };
        }
        catch (error) {
            logger.error('ETH fiyatı alınamadı', { error: error.message });
            throw error;
        }
    }
    // Mevcut token fiyatını al
    async getCurrentTokenPrice(tokenAddress) {
        try {
            if (!this.oracleContract) {
                logger.warn('Oracle contract bulunamadı - varsayılan token fiyatı döndürülüyor');
                return {
                    priceUSD: 1, // Varsayılan token fiyatı
                    priceE18: '1000000000000000000',
                    lastUpdated: new Date().toISOString(),
                    source: 'development'
                };
            }
            const priceE18 = await this.oracleContract.currentTokenPriceE18(tokenAddress);
            const priceUSD = parseFloat(ethers.utils.formatUnits(priceE18, 18));
            return {
                priceUSD,
                priceE18: priceE18.toString(),
                lastUpdated: new Date().toISOString(),
                source: 'oracle'
            };
        }
        catch (error) {
            logger.error('Token fiyatı alınamadı', { error: error.message, tokenAddress });
            throw error;
        }
    }
    // Harici kaynaklardan fiyat al ve güncelle
    async updatePricesFromExternalSource() {
        try {
            logger.info('Harici kaynaklardan fiyat güncellemesi başlatıldı');
            // CoinGecko'dan ETH fiyatı al
            const ethPrice = await this.fetchEthPriceFromCoinGecko();
            if (ethPrice) {
                await this.updateEthPrice(ethPrice, 'coingecko');
            }
            // Binance'den ETH fiyatı al
            const binancePrice = await this.fetchEthPriceFromBinance();
            if (binancePrice) {
                await this.updateEthPrice(binancePrice, 'binance');
            }
            logger.info('Harici kaynaklardan fiyat güncellemesi tamamlandı');
        }
        catch (error) {
            logger.error('Harici kaynaklardan fiyat güncellemesi hatası', { error: error.message });
        }
    }
    // CoinGecko'dan ETH fiyatı al
    async fetchEthPriceFromCoinGecko() {
        try {
            const response = await fetch(`${process.env.COINGECKO_API_URL}/simple/price?ids=ethereum&vs_currencies=usd`);
            const data = await response.json();
            return data.ethereum?.usd || null;
        }
        catch (error) {
            logger.warn('CoinGecko API hatası', { error: error.message });
            return null;
        }
    }
    // Binance'den ETH fiyatı al
    async fetchEthPriceFromBinance() {
        try {
            const response = await fetch(`${process.env.BINANCE_API_URL}/ticker/price?symbol=ETHUSDT`);
            const data = await response.json();
            return parseFloat(data.price) || null;
        }
        catch (error) {
            logger.warn('Binance API hatası', { error: error.message });
            return null;
        }
    }
    // Fiyat güncellemesini veritabanına kaydet
    async savePriceUpdate(update) {
        try {
            const priceUpdate = {
                id: this.generateId(),
                tokenAddress: update.tokenAddress,
                oldPrice: update.oldPrice,
                newPrice: update.newPrice,
                priceUSD: update.priceUSD,
                source: update.source,
                updatedBy: update.updatedBy,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await this.priceUpdateRepository.save(priceUpdate);
            logger.info('Fiyat güncellemesi veritabanına kaydedildi', { update });
        }
        catch (error) {
            logger.error('Fiyat güncellemesi veritabanına kaydedilemedi', { error: error.message, update });
        }
    }
    // Basit ID generator
    generateId() {
        return `price_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // Oracle contract durumunu kontrol et
    async checkOracleHealth() {
        try {
            await this.getCurrentEthPrice();
            return true;
        }
        catch (error) {
            logger.error('Oracle health check başarısız', { error: error.message });
            return false;
        }
    }
    // Gas estimate
    async estimateGasForEthPriceUpdate(priceUSD) {
        try {
            const priceE18 = ethers.utils.parseUnits(priceUSD.toString(), 18);
            const gasEstimate = await this.oracleContract.estimateGas.setEthPrice(priceE18);
            return gasEstimate.toString();
        }
        catch (error) {
            logger.error('Gas estimate hatası', { error: error.message, priceUSD });
            throw error;
        }
    }
}
//# sourceMappingURL=OracleService.js.map