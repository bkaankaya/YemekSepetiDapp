# 🍽️ YemekSepeti Script'leri

Bu klasör, YemekSepeti dApp'inin kurulum ve test işlemleri için gerekli script'leri içerir.

## 📋 Mevcut Script'ler

### 1. `register-multiple-restaurants.js` - Çoklu Restoran Kaydı
**En önemli script!** 8 farklı restoranı sisteme kaydeder.

**Özellikler:**
- 🏪 **8 Restoran**: Farklı mutfak türlerinde
- 🍕 **Çeşitli Menüler**: Kebap, Pizza, Burger, Sushi, Tatlı, Kahve, Pasta, Tavuk
- 💰 **Çift Ödeme**: Her restoran hem ETH hem de FOOD token ile ödeme alabilir
- 🎯 **Gerçekçi Fiyatlar**: USD cinsinden gerçekçi fiyatlandırma
- 📍 **Lokasyon Bilgileri**: İstanbul'un farklı semtlerinde

**Restoranlar:**
1. **Eth Kebap & Grill** - Geleneksel Türk mutfağı
2. **Polygon Pizza** - İtalyan pizza çeşitleri
3. **BSC Burger House** - Amerikan burger çeşitleri
4. **Avalanche Sushi Bar** - Japon sushi çeşitleri
5. **Solana Sweet Shop** - Tatlı ve pasta çeşitleri
6. **Cardano Coffee** - Kahve ve kahvaltı
7. **Polkadot Pasta** - Özel pasta çeşitleri
8. **Chainlink Chicken** - Tavuk çeşitleri

### 2. `seed.js` - Temel Kurulum
Temel restoran ve müşteri kayıtları.

### 3. `register-test-restaurant.js` - Test Restoran
Tek bir test restoranı için.

## 🚀 Nasıl Çalıştırılır

### Ön Gereksinimler
1. Hardhat kurulu olmalı
2. `deploy-output.json` dosyası mevcut olmalı
3. Hardhat node çalışıyor olmalı

### Adım 1: Hardhat Node'u Başlat
```bash
npx hardhat node
```

### Adım 2: Kontratları Deploy Et
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Adım 3: Restoranları Kaydet
```bash
npx hardhat run scripts/register-multiple-restaurants.js --network localhost
```

## 💡 Script Çıktısı

Script başarıyla çalıştığında şu çıktıyı göreceksiniz:

```
🍽️  Çoklu Restoran Kayıt Script'i Başlatılıyor...

✅ Kontratlar bağlandı
🔍 YemekSepeti: 0x...
🔍 Oracle: 0x...
🔍 FOOD Token: 0x...

=== ORACLE FİYAT AYARLARI ===
✅ ETH fiyatı: $3200
✅ FOOD token fiyatı: $1
✅ FOOD token decimal: 18

=== 1. RESTORAN: Eth Kebap & Grill ===
✅ Eth Kebap & Grill kaydedildi
📋 Menü fiyatları ayarlanıyor...
   ✅ Adana Kebap: $8.90
   ✅ Urfa Kebap: $8.90
   ...
🪙 FOOD token kabul ediliyor...
   ✅ Adana Kebap için FOOD token kabul edildi
   ...
✅ Slippage %1 olarak ayarlandı
🎉 Eth Kebap & Grill başarıyla kuruldu!

...

=== ÖZET ===
🏪 Toplam 8 restoran kuruldu
👥 Toplam 2 müşteri kaydedildi
🍽️  Her restoran hem ETH hem de FOOD token ile ödeme alabilir
💰 Oracle fiyatları güncel

=== RESTORAN ADRESLERİ ===
1. Eth Kebap & Grill: 0x...
2. Polygon Pizza: 0x...
...

🎉 Tüm restoranlar başarıyla kuruldu!
```

## 🔧 Özelleştirme

### Yeni Restoran Ekleme
`restaurants` array'ine yeni restoran ekleyebilirsiniz:

```javascript
{
  signer: a11,
  name: "Yeni Restoran",
  address: "İstanbul, Yeni Semt",
  menu: [
    { name: "Yeni Yemek", price: 1000, category: "Kategori" }
  ]
}
```

### Fiyat Değiştirme
`price` değerini USD cent cinsinden verin (örn: 1000 = $10.00).

### Kategori Ekleme
Yeni kategoriler ekleyebilirsiniz.

## ⚠️ Önemli Notlar

1. **Script'i sadece bir kez çalıştırın** - Tekrar çalıştırmak hata verebilir
2. **Hardhat node çalışıyor olmalı** - Ayrı terminal'de
3. **Deploy çıktısı güncel olmalı** - `deploy-output.json` kontrol edin
4. **Gas limit yeterli olmalı** - Hardhat node'da yeterli ETH olmalı

## 🎯 Sonuç

Script başarıyla çalıştıktan sonra:
- ✅ 8 farklı restoran sisteme kayıtlı
- ✅ Her restoranın menüsü hazır
- ✅ ETH ve FOOD token ödemeleri aktif
- ✅ Oracle fiyatları güncel
- ✅ Frontend'de tüm restoranlar görünür

Artık YemekSepeti dApp'inizde çeşitli restoranları test edebilirsiniz! 🚀
