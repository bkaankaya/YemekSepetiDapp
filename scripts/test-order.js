// scripts/test-order.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Sipariş Testi Başlıyor...\n");

  // Contract adresleri
  const YEMEK = "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1";
  const FOOD = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319";

  // Signer'ları al
  const [owner, restaurantOwner, customer] = await ethers.getSigners();
  
  console.log(`👤 Kullanıcı adresleri:`);
  console.log(`   Owner: ${owner.address}`);
  console.log(`   Restaurant Owner: ${restaurantOwner.address}`);
  console.log(`   Customer: ${customer.address}\n`);

  // YemekSepeti kontratını bağla
  const yem = await ethers.getContractAt("YemekSepeti", YEMEK);

  try {
    // 1. Restoran durumunu kontrol et
    console.log("🔍 Restoran durumu kontrol ediliyor...");
    const restaurant = await yem.restaurants(restaurantOwner.address);
    console.log(`   📍 Adres: ${restaurant.realWorldAddress}`);
    console.log(`   🆔 Kayıtlı: ${restaurant.walletAddress !== ethers.constants.AddressZero ? "✅ Evet" : "❌ Hayır"}\n`);

    // 2. Customer durumunu kontrol et
    console.log("🔍 Customer durumu kontrol ediliyor...");
    const customerInfo = await yem.customers(owner.address);
    console.log(`   📍 Adres: ${customerInfo.realWorldAddress}`);
    console.log(`   🆔 Kayıtlı: ${customerInfo.walletAddress !== ethers.constants.AddressZero ? "✅ Evet" : "❌ Hayır"}\n`);

    // 3. Menü fiyatını kontrol et
    console.log("🔍 Menü fiyatı kontrol ediliyor...");
    try {
      const [price, decimals] = await yem.getMenuPriceQuote(restaurantOwner.address, "Adana Kebap");
      console.log(`   💰 Adana Kebap fiyatı: ${ethers.utils.formatEther(price)} USD (${decimals} decimals)\n`);
    } catch (e) {
      console.log(`   ❌ Menü fiyatı bulunamadı: ${e.message}\n`);
    }

    // 4. Token kabul durumunu kontrol et
    console.log("🔍 Token kabul durumu kontrol ediliyor...");
    try {
      const ethAccepted = await yem.isTokenAccepted(restaurantOwner.address, "Adana Kebap", ethers.constants.AddressZero);
      const foodAccepted = await yem.isTokenAccepted(restaurantOwner.address, "Adana Kebap", FOOD);
      console.log(`   💳 ETH kabul: ${ethAccepted ? "✅ Evet" : "❌ Hayır"}`);
      console.log(`   🍎 FOOD kabul: ${foodAccepted ? "✅ Evet" : "❌ Hayır"}\n`);
    } catch (e) {
      console.log(`   ❌ Token kabul kontrolü hatası: ${e.message}\n`);
    }

    // 5. Test siparişi oluştur - DOĞRU FONKSİYON İSMİ
    console.log("📝 Test siparişi oluşturuluyor...");
    
    // Tek ürün için array kullan
    const items = ["Adana Kebap"];
    const qtys = [1];
    const orderValue = ethers.utils.parseEther("0.01"); // 0.01 ETH
    
    const tx = await yem.connect(owner).createOrderETHDynamicMany(
      restaurantOwner.address,
      items,
      qtys,
      { value: orderValue }
    );
    
    console.log(`   ✅ Sipariş oluşturuldu! Transaction hash: ${tx.hash}`);
    await tx.wait();
    console.log(`   ✅ Transaction onaylandı!\n`);

    // 6. Sipariş durumunu kontrol et
    console.log("🔍 Sipariş durumu kontrol ediliyor...");
    try {
      // Son siparişi bul
      const orderCount = await yem.orderCounter();
      console.log(`   📊 Toplam sipariş sayısı: ${orderCount}`);
      
      if (orderCount.gt(0)) {
        const lastOrder = await yem.orders(orderCount.sub(1));
        console.log(`   📦 Son sipariş:`);
        console.log(`      🆔 ID: ${orderCount.sub(1)}`);
        console.log(`      👤 Müşteri: ${lastOrder.customer}`);
        console.log(`      🏪 Restoran: ${lastOrder.restaurant}`);
        console.log(`      🍽️  Ürün: ${lastOrder.itemName}`);
        console.log(`      💰 Tutar: ${ethers.utils.formatEther(lastOrder.price)} ETH`);
        console.log(`      📊 Durum: ${lastOrder.status}`);
      }
    } catch (e) {
      console.log(`   ❌ Sipariş durumu kontrol hatası: ${e.message}\n`);
    }

    console.log("\n🎉 Test siparişi başarılı!");

  } catch (error) {
    console.error("❌ Hata:", error.message);
    
    // Detaylı hata analizi
    if (error.message.includes("reverted")) {
      console.log("\n🔍 Hata Analizi:");
      console.log("   - Transaction revert edildi");
      console.log("   - Smart contract'ta bir sorun var");
      console.log("   - Muhtemelen require statement başarısız");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
