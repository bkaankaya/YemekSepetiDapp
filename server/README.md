# YemekSepeti DApp Backend

Bu backend, YemekSepeti DApp projesi için gelişmiş bir API sunucusudur. Subgraph verilerini senkronize eder, Oracle fiyat güncellemelerini yönetir ve güvenli API endpoints sağlar.

## 🚀 Özellikler

- **Subgraph Senkronizasyonu**: TheGraph'ten blockchain verilerini otomatik olarak çeker ve SQLite veritabanında saklar
- **Oracle Entegrasyonu**: Smart contract fiyat güncellemelerini API key ile korumalı şekilde yönetir
- **GraphQL API**: Apollo Server ile GraphQL endpoint'i
- **REST API**: Express.js ile RESTful endpoints
- **Otomatik Senkronizasyon**: Cron job'lar ile düzenli veri güncellemesi
- **Güvenlik**: API key doğrulama, rate limiting, CORS, Helmet
- **Logging**: Winston ile kapsamlı loglama
- **TypeScript**: Tam TypeScript desteği

## 📋 Gereksinimler

- Node.js 18+
- npm veya yarn
- Hardhat node çalışıyor olmalı
- Subgraph çalışıyor olmalı

## 🛠️ Kurulum

1. **Bağımlılıkları yükle:**
```bash
npm install
```

2. **Environment variables'ları ayarla:**
```bash
cp env.example .env
# .env dosyasını düzenle
```

3. **Veritabanını başlat:**
```bash
npm run db:migrate
```

4. **Development modunda çalıştır:**
```bash
npm run dev
```

## 🔧 Environment Variables

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
DB_TYPE=sqlite
DB_DATABASE=database.sqlite

# Blockchain Configuration
RPC_URL=http://127.0.0.1:8545
ADMIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Oracle Configuration
ORACLE_API_KEY=your-secret-oracle-api-key-here

# Subgraph Configuration
SUBGRAPH_ENDPOINT=http://localhost:8000/subgraphs/name/yemeksepeti-subgraph

# Logging
LOG_LEVEL=info
```

## 🚀 API Endpoints

### Oracle API (`/api/oracle`)

#### Fiyat Güncelleme (API Key Gerekli)
- `POST /update-eth-price` - ETH fiyatını güncelle
- `POST /update-token-price` - Token fiyatını güncelle
- `POST /batch-update-prices` - Toplu fiyat güncellemesi

#### Fiyat Sorgulama (API Key Gerekli Değil)
- `GET /eth-price` - Mevcut ETH fiyatını al
- `GET /token-price/:tokenAddress` - Token fiyatını al

### Data API (`/api/data`)

#### Veri Yönetimi
- `POST /sync` - Manuel veri senkronizasyonu (API Key gerekli)
- `GET /stats` - Veri istatistikleri
- `GET /customers` - Müşteri listesi
- `GET /restaurants` - Restoran listesi
- `GET /orders` - Sipariş listesi
- `GET /price-updates` - Fiyat güncelleme geçmişi

### GraphQL API
- `POST /graphql` - GraphQL endpoint

### Health Check
- `GET /health` - Servis durumu

## 🔐 API Key Kullanımı

Oracle fiyat güncelleme işlemleri için API key gereklidir:

```bash
# Header ile
curl -X POST http://localhost:4000/api/oracle/update-eth-price \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key-here" \
  -d '{"priceUSD": 2500}'

# Query parameter ile
curl -X POST "http://localhost:4000/api/oracle/update-eth-price?apiKey=your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"priceUSD": 2500}'
```

## 📊 Veritabanı Şeması

### Entities
- **Customer**: Müşteri bilgileri
- **Restaurant**: Restoran bilgileri
- **MenuItem**: Menü öğeleri
- **Order**: Sipariş bilgileri
- **PriceUpdate**: Fiyat güncelleme geçmişi

## ⏰ Otomatik İşlemler

- **Subgraph Senkronizasyonu**: Her 5 dakikada bir
- **Oracle Fiyat Güncellemesi**: Her saat başı
- **Günlük Temizlik**: Her gece yarısı

## 🚀 Production Deployment

1. **Build:**
```bash
npm run build
```

2. **Start:**
```bash
npm start
```

3. **Environment variables'ları production değerleriyle güncelle**
4. **Veritabanı bağlantısını production veritabanına yönlendir**
5. **Log seviyesini 'error' olarak ayarla**

## 🔍 Monitoring

- **Logs**: `logs/` klasöründe
- **Health Check**: `/health` endpoint
- **Metrics**: `/api/data/stats` endpoint

## 🛡️ Güvenlik

- API key doğrulama
- Rate limiting (100 istek/dakika)
- CORS koruması
- Helmet güvenlik başlıkları
- Input validation
- SQL injection koruması (TypeORM)

## 🐛 Troubleshooting

### Veritabanı Bağlantı Hatası
- SQLite dosyasının yazma izni olduğundan emin ol
- `database.sqlite` dosyasının mevcut olduğunu kontrol et

### Oracle Bağlantı Hatası
- Hardhat node'un çalıştığından emin ol
- `ADMIN_PRIVATE_KEY`'in doğru olduğunu kontrol et
- `RPC_URL`'nin erişilebilir olduğunu kontrol et

### Subgraph Bağlantı Hatası
- Subgraph'in çalıştığından emin ol
- `SUBGRAPH_ENDPOINT`'in doğru olduğunu kontrol et

## 📝 License

MIT License
