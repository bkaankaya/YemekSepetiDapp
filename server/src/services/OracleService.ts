import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Oracle ABI - sadece gerekli fonksiyonlar
const ORACLE_ABI = [
  "function setEthPrice(uint256 priceE18) external",
  "function setTokenPrice(address token, uint256 priceE18) external",
  "function grantFeeder(address account) external",
  "function currentEthPriceE18() external view returns (uint256)",
  "function currentTokenPriceE18(address token) external view returns (uint256)",
  "function getTokenPrice(address token) external view returns (uint256)"
];

export class OracleService {
  private provider: ethers.providers.JsonRpcProvider;
  private oracleContract: ethers.Contract;
  private adminWallet: ethers.Wallet;
  private isInitialized: boolean = false;

  constructor() {
    const deployOutput = JSON.parse(readFileSync(join(__dirname, '../../../deploy-output.json'), 'utf8'));
    const oracleAddress = deployOutput.Oracle;
    
    // RPC URL'yi environment variable'dan al
    const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.adminWallet = new ethers.Wallet(adminPrivateKey, this.provider);
    this.oracleContract = new ethers.Contract(oracleAddress, ORACLE_ABI, this.adminWallet);
    
    logger.info(`🔗 Oracle servisi başlatıldı: ${oracleAddress}`);
  }

  async initialize() {
    try {
      // Admin olarak yetki ver
      await this.grantFeederRole(this.adminWallet.address);
      this.isInitialized = true;
      logger.info('✅ Oracle servisi başarıyla başlatıldı');
    } catch (error) {
      logger.error('❌ Oracle servisi başlatılamadı:', error);
      throw error;
    }
  }

  private async grantFeederRole(address: string) {
    try {
      const tx = await this.oracleContract.grantFeeder(address);
      await tx.wait();
      logger.info(`🔑 Feeder yetkisi verildi: ${address}`);
    } catch (error) {
      // Eğer zaten yetkisi varsa hata verme
      if (error.message.includes('already has role')) {
        logger.info(`ℹ️ ${address} zaten feeder yetkisine sahip`);
      } else {
        throw error;
      }
    }
  }

  async updateEthPrice(priceUSD: number) {
    if (!this.isInitialized) {
      throw new Error('Oracle servisi henüz başlatılmadı');
    }

    try {
      // USD fiyatını 1e18 formatına çevir
      const priceE18 = ethers.utils.parseUnits(priceUSD.toString(), 18);
      
      const tx = await this.oracleContract.setEthPrice(priceE18);
      await tx.wait();
      
      logger.info(`💰 ETH fiyatı güncellendi: $${priceUSD} (${priceE18.toString()})`);
      return tx.hash;
    } catch (error) {
      logger.error('❌ ETH fiyatı güncellenirken hata:', error);
      throw error;
    }
  }

  async updateTokenPrice(tokenAddress: string, priceUSD: number) {
    if (!this.isInitialized) {
      throw new Error('Oracle servisi henüz başlatılmadı');
    }

    try {
      // USD fiyatını 1e18 formatına çevir
      const priceE18 = ethers.utils.parseUnits(priceUSD.toString(), 18);
      
      const tx = await this.oracleContract.setTokenPrice(tokenAddress, priceE18);
      await tx.wait();
      
      logger.info(`🪙 Token fiyatı güncellendi: ${tokenAddress} -> $${priceUSD} (${priceE18.toString()})`);
      return tx.hash;
    } catch (error) {
      logger.error('❌ Token fiyatı güncellenirken hata:', error);
      throw error;
    }
  }

  async getCurrentEthPrice(): Promise<number> {
    try {
      const priceE18 = await this.oracleContract.currentEthPriceE18();
      return parseFloat(ethers.utils.formatUnits(priceE18, 18));
    } catch (error) {
      logger.error('❌ ETH fiyatı alınırken hata:', error);
      throw error;
    }
  }

  async getCurrentTokenPrice(tokenAddress: string): Promise<number> {
    try {
      const priceE18 = await this.oracleContract.currentTokenPriceE18(tokenAddress);
      return parseFloat(ethers.utils.formatUnits(priceE18, 18));
    } catch (error) {
      logger.error('❌ Token fiyatı alınırken hata:', error);
      throw error;
    }
  }

  // API key ile korumalı fiyat güncelleme
  async updatePriceWithAuth(apiKey: string, tokenAddress: string, priceUSD: number) {
    // API key doğrulama
    if (!this.validateApiKey(apiKey)) {
      throw new Error('Geçersiz API key');
    }

    return await this.updateTokenPrice(tokenAddress, priceUSD);
  }

  private validateApiKey(apiKey: string): boolean {
    const validApiKey = process.env.ORACLE_API_KEY;
    return validApiKey && apiKey === validApiKey;
  }

  // Otomatik fiyat güncelleme (cron job için)
  async updatePricesFromExternalSource() {
    try {
      // Burada harici API'den fiyatları çekebilirsiniz
      // Örnek: CoinGecko, Binance, vs.
      logger.info('🔄 Harici kaynaklardan fiyat güncellemesi başlatılıyor...');
      
      // TODO: Harici API entegrasyonu
      // const ethPrice = await this.fetchEthPriceFromExternalAPI();
      // await this.updateEthPrice(ethPrice);
      
      logger.info('✅ Harici fiyat güncellemesi tamamlandı');
    } catch (error) {
      logger.error('❌ Harici fiyat güncellemesi hatası:', error);
    }
  }
}
