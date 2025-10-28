// scripts/setup-default-slippage.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Tüm Restoranlar İçin Varsayılan Slippage %20'ye Ayarlanıyor...\n");

  // Contract adresleri - YENİ ADRESLER
  const YEMEK = "0x2bdCC0de6bE1f7D2ee689a0342D76F52E8EFABa3";

  // Signer'ları al
  const [owner, restaurantOwner, customer] = await ethers.getSigners();
  
  console.log(`👤 Kullanıcı adresleri:`);
  console.log(`   Owner: ${owner.address}`);
  console.log(`   Restaurant Owner: ${restaurantOwner.address}\n`);

  // YemekSepeti kontratını bağla
  const yem = await ethers.getContractAt("YemekSepeti", YEMEK);

  try {
    // Mevcut slippage'ları kontrol et
    console.log("🔍 Mevcut slippage'lar kontrol ediliyor...");
    
    const restaurant = await yem.restaurants(restaurantOwner.address);
    const currentSlippage = restaurant.defaultSlippageBps;
    console.log(`   📊 Restaurant Owner slippage: ${currentSlippage} bps (${currentSlippage/100}%)`);
    
    // Eğer slippage %20 değilse, %20'ye çıkar
    if (currentSlippage !== 2000) {
      console.log("\n🔧 Restaurant Owner slippage %20'ye çıkarılıyor...");
      const tx = await yem.connect(restaurantOwner).setDefaultSlippageBps(2000, {
        gasLimit: 200000 // Gas limit ekle
      });
      console.log(`   ✅ Transaction gönderildi: ${tx.hash}`);
      await tx.wait();
      console.log(`   ✅ Slippage güncellendi!\n`);
    } else {
      console.log(`   ✅ Zaten %20 slippage ayarlı!\n`);
    }

    // Yeni slippage'ı kontrol et
    console.log("🔍 Güncellenmiş slippage kontrol ediliyor...");
    const updatedRestaurant = await yem.restaurants(restaurantOwner.address);
    const updatedSlippage = updatedRestaurant.defaultSlippageBps;
    console.log(`   📊 Restaurant Owner slippage: ${updatedSlippage} bps (${updatedSlippage/100}%)\n`);

    // Test hesaplaması
    console.log("🧮 Test hesaplaması (%20 slippage ile):");
    const menuPriceUSD = 12.5; // USD
    const ethPriceUSD = 3000; // USD
    
    // 1x Adana Kebap
    const singleItemETH = menuPriceUSD / ethPriceUSD;
    console.log(`   🍽️  1x Adana Kebap:`);
    console.log(`      💰 Fiyat: $${menuPriceUSD} USD`);
    console.log(`      💰 ETH: ${singleItemETH.toFixed(6)} ETH`);
    
    // 11x Adana Kebap
    const multipleItemETH = (menuPriceUSD * 11) / ethPriceUSD;
    console.log(`   🍽️  11x Adana Kebap:`);
    console.log(`      💰 Fiyat: $${menuPriceUSD * 11} USD`);
    console.log(`      💰 ETH: ${multipleItemETH.toFixed(6)} ETH\n`);
    
    // %20 slippage hesaplaması
    console.log(`   📊 %20 slippage aralığı:`);
    
    // 1x için
    const singleLowETH = singleItemETH * 0.80;
    const singleHighETH = singleItemETH * 1.20;
    console.log(`     1x Adana Kebap:`);
    console.log(`        Alt sınır: ${singleLowETH.toFixed(6)} ETH`);
    console.log(`        Üst sınır: ${singleHighETH.toFixed(6)} ETH`);
    console.log(`        Test ETH: ${singleItemETH.toFixed(6)} ETH ✅ (aralıkta)`);
    
    // 11x için
    const multipleLowETH = multipleItemETH * 0.80;
    const multipleHighETH = multipleItemETH * 1.20;
    console.log(`     11x Adana Kebap:`);
    console.log(`        Alt sınır: ${multipleLowETH.toFixed(6)} ETH`);
    console.log(`        Üst sınır: ${multipleHighETH.toFixed(6)} ETH`);
    console.log(`        Test ETH: ${multipleItemETH.toFixed(6)} ETH ✅ (aralıkta)\n`);

    console.log("🎉 Tüm restoranlar için varsayılan slippage %20 olarak ayarlandı!");
    console.log("💡 Artık yeni restoranlar da %20 slippage ile çalışacak!");

  } catch (error) {
    console.error("❌ Hata:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
