# YemekSepeti DApp Backend

Bu proje, YemekSepeti DApp'inin backend API'sini içerir. Blockchain verilerini TheGraph'ten çeker, Redis'te saklar ve Oracle smart contract'ları ile etkileşim kurar.

## 🚀 Özellikler

- **Redis Veritabanı**: Hızlı ve ölçeklenebilir veri saklama
- **Oracle Entegrasyonu**: Smart contract fiyat güncellemeleri
- **Subgraph Senkronizasyonu**: TheGraph'ten veri çekme
- **API Key Authentication**: Güvenli API erişimi
- **Rate Limiting**: Redis tabanlı hız sınırlama
- **Cron Jobs**: Otomatik veri senkronizasyonu
- **Logging**: Winston tabanlı yapılandırılmış loglama
- **TypeScript**: Tip güvenli kod yazımı

## 📋 Gereksinimler

- Node.js 18+
- Redis 6+
- Ethereum node (local veya remote)

## 🛠️ Kurulum

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Environment dosyasını oluşturun:**
```bash
cp .env.example .env
```

3. **Environment değişkenlerini düzenleyin:**
```env
# Server Configuration
PORT=3000
NODE_ENV=development
HOST=localhost

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=yemeksepeti:

# Blockchain Configuration
RPC_URL=http://127.0.0.1:8545
ADMIN_PRIVATE_KEY=your_admin_private_key_here
CHAIN_ID=1337

# Oracle Configuration
ORACLE_API_KEY=your_oracle_api_key_here
ORACLE_CONTRACT_ADDRESS=your_oracle_contract_address_here

# Subgraph Configuration
SUBGRAPH_ENDPOINT=http://localhost:8000/subgraphs/name/yemeksepeti-subgraph
SUBGRAPH_SYNC_INTERVAL=300000

# Security Configuration
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=logs

# External APIs
COINGECKO_API_URL=https://api.coingecko.com/api/v3
BINANCE_API_URL=https://api.binance.com/api/v3

# API Key Configuration
API_KEY=your_api_key_here
```

4. **Redis'i başlatın:**
```bash
# Docker ile
docker run -d --name redis -p 6379:6379 redis:6-alpine

# Veya sistem servisi olarak
sudo systemctl start redis
```

5. **Veritabanını hazırlayın:**
```bash
# Migration'ları çalıştırın
npm run migrate

# Seed verilerini ekleyin
npm run seed
```

6. **Uygulamayı başlatın:**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 🏗️ Proje Yapısı

```
backend/
├── src/
│   ├── config/          # Konfigürasyon dosyaları
│   ├── constants/       # Sabitler
│   ├── data/           # Veri erişim katmanı
│   │   ├── repositories/ # Redis repository'leri
│   │   └── types/      # Veri tipleri
│   ├── middleware/     # Express middleware'leri
│   ├── routes/         # API route'ları
│   ├── services/       # İş mantığı servisleri
│   ├── utils/          # Yardımcı fonksiyonlar
│   └── index.ts        # Ana uygulama
├── database/           # Veritabanı scriptleri
├── logs/              # Log dosyaları
└── package.json
```

## 🔌 API Endpoints

### Oracle API (`/api/oracle`)
- `POST /update-eth-price` - ETH fiyatını güncelle
- `POST /update-token-price` - Token fiyatını güncelle
- `POST /batch-update-prices` - Toplu fiyat güncellemesi
- `GET /eth-price` - Mevcut ETH fiyatını al
- `GET /token-price/:tokenAddress` - Token fiyatını al
- `GET /health` - Oracle durumu

### Data API (`/api/data`)
- `POST /sync` - Veri senkronizasyonu
- `GET /stats` - Sistem istatistikleri
- `GET /customers` - Müşteri listesi
- `GET /restaurants` - Restoran listesi
- `GET /orders` - Sipariş listesi
- `GET /price-updates` - Fiyat güncelleme geçmişi

### Auth API (`/api/auth`)
- `GET /profile` - Kullanıcı profili
- `GET /health` - Auth servisi durumu

## 🔐 Authentication

API key authentication kullanılır. Header'da `X-API-Key` veya `Authorization: Bearer <api-key>` olarak gönderilmelidir.

## 📊 Redis Veri Yapısı

### Key Patterns
- `yemeksepeti:customer:{id}` - Müşteri verileri
- `yemeksepeti:restaurant:{id}` - Restoran verileri
- `yemeksepeti:menu_item:{id}` - Menü öğesi verileri
- `yemeksepeti:order:{id}` - Sipariş verileri
- `yemeksepeti:price_update:{id}` - Fiyat güncelleme verileri
- `yemeksepeti:user:{id}` - Kullanıcı verileri

### Index Sets
- `yemeksepeti:customer:customer_index` - Müşteri ID'leri
- `yemeksepeti:restaurant:restaurant_index` - Restoran ID'leri
- `yemeksepeti:menu_item:menu_item_index` - Menü öğesi ID'leri
- `yemeksepeti:order:order_index` - Sipariş ID'leri
- `yemeksepeti:price_update:price_update_index` - Fiyat güncelleme ID'leri
- `yemeksepeti:user:user_index` - Kullanıcı ID'leri

## 🚀 Cron Jobs

- **Subgraph Sync**: Her 5 dakikada bir
- **Oracle Update**: Her saat başı
- **Daily Cleanup**: Her gece yarısı
- **External Price Fetch**: Her 15 dakikada bir

## 📝 Logging

Winston kullanılarak yapılandırılmış loglama:
- **Console**: Development ortamında
- **File**: Production ortamında
- **Levels**: error, warn, info, debug

## 🧪 Test

```bash
# Unit testleri çalıştır
npm test

# Test coverage
npm run test:coverage
```

## 📦 Build

```bash
# TypeScript derleme
npm run build

# Production build
npm run build:prod
```

## 🐳 Docker

```bash
# Image build
docker build -t yemeksepeti-backend .

# Container çalıştır
docker run -p 3000:3000 yemeksepeti-backend
```

## 🔧 Development

```bash
# Linting
npm run lint

# Code formatting
npm run format

# Watch mode
npm run dev
```

## 📚 Dependencies

### Production
- `express` - Web framework
- `redis` - Redis client
- `ethers` - Ethereum library
- `axios` - HTTP client
- `node-cron` - Cron job scheduler
- `winston` - Logging
- `rate-limiter-flexible` - Rate limiting
- `joi` - Validation
- `helmet` - Security headers
- `compression` - Response compression
- `cors` - CORS middleware

### Development
- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution
- `jest` - Testing framework
- `eslint` - Linting
- `prettier` - Code formatting

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Sorunlar için GitHub Issues kullanın veya ekibimizle iletişime geçin.

## 🔄 Changelog

### v1.0.0
- Redis veritabanı entegrasyonu
- Oracle smart contract entegrasyonu
- Subgraph senkronizasyonu
- API key authentication
- Cron job'lar
- Comprehensive logging
- TypeScript support
