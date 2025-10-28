# 🚀 YemekSepeti DApp Deployment Guide

Bu rehber, YemekSepeti DApp'i production'a deploy etmek için gerekli adımları açıklar.

## 📋 Ön Gereksinimler

- Node.js 18+ 
- npm v9+
- MetaMask veya benzeri wallet
- Sepolia testnet ETH
- GitHub hesabı

## 🔧 Kurulum Adımları

### 1. Proje Klonla
```bash
git clone <repository-url>
cd YemekSepetiDapp
npm install
```

### 2. Environment Variables
```bash
# .env dosyası oluştur
cp .env.example .env

# Gerekli değerleri doldur
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Smart Contracts Deploy Et
```bash
# Hardhat network'i yapılandır
npx hardhat compile

# Sepolia'ya deploy et
npx hardhat run scripts/deploy.js --network sepolia

# Deploy output'u kaydet
cp deploy-output.json frontend/src/
cp deploy-output.json server/src/
```

### 4. Subgraph Kurulumu
```bash
# The Graph CLI kur
npm install -g @graphprotocol/graph-cli

# Subgraph oluştur
cd yemeksepeti-subgraph
npm install
npm run codegen
npm run build
```

### 5. Subgraph Deploy Et
```bash
# GitHub kullanıcı adınla deploy et
npm run deploy

# Veya manuel olarak
graph auth --product hosted-service <GITHUB_USERNAME>
graph deploy --product hosted-service <GITHUB_USERNAME>/yemeksepeti-subgraph
```

### 6. GraphQL Server Deploy Et
```bash
# Server'ı production'a deploy et
cd server
npm install
npm run build

# PM2 ile daemon olarak çalıştır
npm install -g pm2
pm2 start dist/index.js --name "yemeksepeti-graphql"
pm2 save
pm2 startup
```

### 7. Frontend Deploy Et
```bash
# Frontend build et
cd frontend
npm install
npm run build

# Vercel'e deploy et (önerilen)
npm install -g vercel
vercel --prod

# Veya Netlify'e deploy et
npm install -g netlify-cli
netlify deploy --prod
```

## 🌐 Production URLs

Deploy sonrası şu URL'ler aktif olacak:

- **Frontend**: `https://your-app.vercel.app`
- **GraphQL API**: `https://your-api-domain.com/graphql`
- **Subgraph**: `https://thegraph.com/hosted-service/<username>/yemeksepeti-subgraph`

## 🔍 Test Etme

### 1. Smart Contract Testleri
```bash
npx hardhat test
```

### 2. Subgraph Testleri
```bash
cd yemeksepeti-subgraph
npm test
```

### 3. GraphQL API Testleri
```bash
# Test script'ini çalıştır
node scripts/test-graphql-queries.js
```

### 4. End-to-End Testleri
```bash
# Test siparişi oluştur
node scripts/test-graphql.js
```

## 📊 Monitoring

### 1. Subgraph Health
- [The Graph Dashboard](https://thegraph.com/hosted-service/dashboard)
- Indexing durumunu kontrol et
- Query performance'ı izle

### 2. Server Monitoring
```bash
# PM2 status
pm2 status
pm2 logs yemeksepeti-graphql

# Server metrics
pm2 monit
```

### 3. Blockchain Monitoring
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- Contract interaction'ları izle
- Gas usage'ı takip et

## 🚨 Troubleshooting

### Subgraph Deploy Hatası
```bash
# Build hatası
npm run build

# ABI uyumsuzluğu
# ABI dosyasını güncelle ve tekrar build et
```

### GraphQL Server Hatası
```bash
# Port çakışması
# .env'de PORT değiştir
PORT=4001

# Dependency hatası
npm install
npm run build
```

### Frontend Build Hatası
```bash
# TypeScript hatası
npm run typecheck

# Build hatası
npm run build
```

## 🔐 Security Checklist

- [ ] Private key'ler .env'de saklanıyor
- [ ] .env dosyası .gitignore'da
- [ ] HTTPS kullanılıyor
- [ ] CORS ayarları yapılandırıldı
- [ ] Rate limiting aktif
- [ ] Input validation yapılıyor

## 📈 Performance Optimization

### 1. Subgraph
- Indexing start block'i optimize et
- Event handler'ları optimize et
- Entity relationship'ları optimize et

### 2. GraphQL Server
- Query complexity limit'i ayarla
- Depth limit'i ayarla
- Caching implement et

### 3. Frontend
- Code splitting kullan
- Lazy loading implement et
- Bundle size'ı optimize et

## 🔄 Update Process

### 1. Smart Contract Update
```bash
# Yeni kontrat deploy et
npx hardhat run scripts/deploy.js --network sepolia

# Subgraph'ı güncelle
cd yemeksepeti-subgraph
# subgraph.yaml'da address güncelle
npm run build
npm run deploy
```

### 2. Subgraph Update
```bash
cd yemeksepeti-subgraph
# Schema veya mapping güncelle
npm run codegen
npm run build
npm run deploy
```

### 3. Server Update
```bash
cd server
# Code güncelle
npm run build
pm2 restart yemeksepeti-graphql
```

## 📞 Support

Deployment sırasında sorun yaşarsanız:

1. **GitHub Issues**: Repository'de issue açın
2. **Discord**: Community kanalına katılın
3. **Documentation**: README.md'yi kontrol edin
4. **Logs**: Console log'ları inceleyin

---

**🎉 Deployment tamamlandı! Artık blockchain tabanlı yemek sipariş platformunuz çalışıyor!** 🚀
