# 🍕 YemekSepeti DApp

Blockchain tabanlı yemek sipariş platformu - Sepolia testnet'te çalışan akıllı kontratlar ve GraphQL API.

## 🚀 Özellikler

- **Smart Contracts**: YemekSepeti, Escrow, Oracle ve FOOD Token
- **GraphQL Subgraph**: Blockchain event'lerini index'leyen The Graph subgraph
- **GraphQL Server**: Frontend için API sağlayan Apollo Server
- **Frontend**: React + TypeScript ile modern UI
- **Real-time Updates**: WebSocket subscription'ları

## 🏗️ Proje Yapısı

```
YemekSepetiDapp/
├── contracts/           # Solidity smart contracts
├── yemeksepeti-subgraph/ # The Graph subgraph
├── server/              # GraphQL server
├── frontend/            # React frontend
└── scripts/             # Deployment ve test scriptleri
```

## 🔧 Kurulum

### 1. Bağımlılıkları Kur
```bash
npm install
cd frontend && npm install
cd ../server && npm install
cd ../yemeksepeti-subgraph && npm install
```

### 2. Environment Variables
```bash
# .env dosyası oluştur
cp .env.example .env
# Gerekli değerleri doldur
```

### 3. Smart Contracts Deploy Et
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Subgraph Deploy Et
```bash
cd yemeksepeti-subgraph
npm run deploy
```

### 5. GraphQL Server Başlat
```bash
cd server
npm run dev
```

### 6. Frontend Başlat
```bash
cd frontend
npm run dev
```

## 📊 GraphQL API

### Endpoint
```
http://localhost:4000/graphql
```

### Örnek Queries

#### Tüm Siparişleri Getir
```graphql
query GetOrders {
  orders {
    id
    orderId
    customer
    restaurant
    itemName
    status
    createdAt
  }
}
```

#### Belirli Siparişi Getir
```graphql
query GetOrder($id: ID!) {
  order(id: $id) {
    id
    orderId
    customer
    restaurant
    itemName
    price
    status
    createdAt
  }
}
```

#### Yeni Sipariş Oluştur
```graphql
mutation CreateOrder($customer: String!, $restaurant: String!, $itemName: String!) {
  createOrder(customer: $customer, restaurant: $restaurant, itemName: $itemName) {
    id
    orderId
    status
    createdAt
  }
}
```

## 🔗 Smart Contract Adresleri

- **YemekSepeti**: `0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0`
- **Escrow**: `0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82`
- **Oracle**: `0x0B306BF915C4d645ff596e518fAf3F9669b97016`
- **FOOD Token**: `0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE`

## 📈 Subgraph

The Graph subgraph blockchain event'lerini index'ler:

- **OrderCreated**: Yeni sipariş oluşturulduğunda
- **OrderConfirmed**: Sipariş onaylandığında
- **OrderCancelled**: Sipariş iptal edildiğinde
- **OrderStatusUpdated**: Sipariş durumu güncellendiğinde
- **DefaultSlippageUpdated**: Restoran slippage ayarı güncellendiğinde
- **ItemSlippageUpdated**: Ürün slippage ayarı güncellendiğinde

## 🎯 Kullanım Senaryoları

### Restoran Sahibi
- Menü ürünlerini ekle/güncelle
- Token kabul ayarlarını yap
- Siparişleri onayla/reddet
- Slippage ayarlarını yap

### Müşteri
- Restoran menülerini görüntüle
- Sipariş ver (ETH veya FOOD token ile)
- Sipariş durumunu takip et
- Siparişi iptal et

### Admin
- Sistem geneli metrikleri görüntüle
- Restoran performanslarını takip et
- Oracle fiyat güncellemelerini izle

## 🛠️ Geliştirme

### Subgraph Geliştirme
```bash
cd yemeksepeti-subgraph
npm run codegen    # TypeScript types generate et
npm run build      # Subgraph build et
npm run deploy     # Deploy et
```

### GraphQL Server Geliştirme
```bash
cd server
npm run dev        # Development server başlat
```

### Frontend Geliştirme
```bash
cd frontend
npm run dev        # Development server başlat
npm run build      # Production build
```

## 🔍 Test

### Smart Contract Testleri
```bash
npx hardhat test
```

### Subgraph Testleri
```bash
cd yemeksepeti-subgraph
npm test
```

## 📚 Dokümantasyon

- [The Graph Documentation](https://thegraph.com/docs/)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)
- [Hardhat Documentation](https://hardhat.org/docs/)
- [Ethers.js Documentation](https://docs.ethers.io/)

## 🤝 Katkıda Bulunma

1. Fork yap
2. Feature branch oluştur (`git checkout -b feature/amazing-feature`)
3. Commit yap (`git commit -m 'Add amazing feature'`)
4. Push yap (`git push origin feature/amazing-feature`)
5. Pull Request oluştur

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Sorun yaşarsanız:
- GitHub Issues açın
- Discord kanalımıza katılın
- Email gönderin

---

**🍕 Blockchain ile yemek siparişi artık çok kolay!** 🚀


