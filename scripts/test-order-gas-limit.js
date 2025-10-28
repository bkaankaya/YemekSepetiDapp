// scripts/test-order-gas-limit.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Gas Limit ile Sipariş Testi Başlıyor...\n");

  // Contract adresleri
  const YEMEK = "0x2bdCC0de6bE1f7D2ee689a0342D76F52E8EFABa3";
  const FOOD = "0xc351628EB244ec633d5f21fBD6621e1a683B1181";

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

    // 3. Oracle durumunu kontrol et
    console.log("🔍 Oracle durumu kontrol ediliyor...");
    try {
      const oracle = await ethers.getContractAt("DummyOracle", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
      const ethPrice = await oracle.currentEthPriceE18();
      console.log(`   💰 ETH fiyatı: $${ethers.utils.formatEther(ethPrice)} USD\n`);
    } catch (e) {
      console.log(`   ❌ Oracle kontrol hatası: ${e.message}\n`);
    }

    // 4. Escrow durumunu kontrol et
    console.log("🔍 Escrow durumu kontrol ediliyor...");
    try {
      const escrow = await ethers.getContractAt("Escrow", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
      console.log(`   ✅ Escrow kontratı bulundu: ${escrow.address}\n`);
    } catch (e) {
      console.log(`   ❌ Escrow kontrol hatası: ${e.message}\n`);
    }

    // 5. Menü fiyatını kontrol et
    console.log("🔍 Menü fiyatı kontrol ediliyor...");
    try {
      const [price, decimals] = await yem.getMenuPriceQuote(restaurantOwner.address, "Adana Kebap");
      console.log(`   💰 Adana Kebap fiyatı: ${ethers.utils.formatEther(price)} USD (${decimals} decimals)\n`);
    } catch (e) {
      console.log(`   ❌ Menü fiyatı bulunamadı: ${e.message}\n`);
    }

    // 6. Token kabul durumunu kontrol et
    console.log("🔍 Token kabul durumu kontrol ediliyor...");
    try {
      const ethAccepted = await yem.isTokenAccepted(restaurantOwner.address, "Adana Kebap", ethers.constants.AddressZero);
      const foodAccepted = await yem.isTokenAccepted(restaurantOwner.address, "Adana Kebap", FOOD);
      console.log(`   💳 ETH kabul: ${ethAccepted ? "✅ Evet" : "❌ Hayır"}`);
      console.log(`   🍎 FOOD kabul: ${foodAccepted ? "✅ Evet" : "❌ Hayır"}\n`);
    } catch (e) {
      console.log(`   ❌ Token kabul kontrolü hatası: ${e.message}\n`);
    }

    // 7. Gas limit ile test siparişi oluştur (Görseldeki miktarlarla)
    console.log("📝 Gas limit ile test siparişi oluşturuluyor...");
    
    // Görseldeki gibi 11x Adana Kebap siparişi
    const items = ["Adana Kebap"];
    const qtys = [11]; // 11 adet
    
    // Görseldeki miktar: 0.045833333333333333 ETH (11x Adana Kebap)
    const requiredEthAmount = ethers.utils.parseEther("0.045833333333333333");
    
    console.log(`   🍽️  Sipariş: 11x Adana Kebap`);
    console.log(`   💰 Gereken ETH: ${ethers.utils.formatEther(requiredEthAmount)} ETH (137.5 USD)`);
    console.log(`   ⛽ Gas limit: 500,000`);
    
    const tx = await yem.connect(owner).createOrderETHDynamicMany(
      restaurantOwner.address,
      items,
      qtys,
      { 
        value: requiredEthAmount, 
        gasLimit: 500000 
      }
    );
    
    console.log(`   ✅ Sipariş oluşturuldu! Transaction hash: ${tx.hash}`);
    console.log(`   ⏳ Transaction bekleniyor...`);
    
    const receipt = await tx.wait();
    console.log(`   ✅ Transaction onaylandı! Gas used: ${receipt.gasUsed.toString()}\n`);

    // 8. Sipariş durumunu kontrol et
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

    console.log("\n🎉 Gas limit ile test siparişi başarılı!");

  } catch (error) {
    console.error("❌ Hata:", error.message);
    
    // Detaylı hata analizi
    if (error.message.includes("reverted")) {
      console.log("\n🔍 Hata Analizi:");
      console.log("   - Transaction revert edildi");
      console.log("   - Smart contract'ta bir sorun var");
      console.log("   - Muhtemelen require statement başarısız");
    }
    
    if (error.message.includes("gas")) {
      console.log("\n⛽ Gas Hatası:");
      console.log("   - Gas limit yetersiz olabilir");
      console.log("   - Daha yüksek gas limit deneyin");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
