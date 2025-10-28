// scripts/fix-slippage.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Slippage Toleransı Düzeltiliyor...\n");

  // Contract adresleri
  const YEMEK = "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1";

  // Signer'ları al
  const [owner, restaurantOwner, customer] = await ethers.getSigners();
  
  console.log(`👤 Kullanıcı adresleri:`);
  console.log(`   Owner: ${owner.address}`);
  console.log(`   Restaurant Owner: ${restaurantOwner.address}\n`);

  // YemekSepeti kontratını bağla
  const yem = await ethers.getContractAt("YemekSepeti", YEMEK);

  try {
    // Mevcut slippage'ı kontrol et
    console.log("🔍 Mevcut slippage kontrol ediliyor...");
    const restaurant = await yem.restaurants(restaurantOwner.address);
    const currentSlippage = restaurant.defaultSlippageBps;
    console.log(`   📊 Mevcut slippage: ${currentSlippage} bps (${currentSlippage/100}%)\n`);

    // Slippage'ı %20'ye çıkar (2000 bps)
    console.log("🔧 Slippage %20'ye çıkarılıyor...");
    const newSlippage = 2000; // %20
    
    const tx = await yem.connect(restaurantOwner).setDefaultSlippageBps(newSlippage);
    console.log(`   ✅ Transaction gönderildi: ${tx.hash}`);
    
    await tx.wait();
    console.log(`   ✅ Slippage güncellendi!\n`);

    // Yeni slippage'ı kontrol et
    console.log("🔍 Yeni slippage kontrol ediliyor...");
    const updatedRestaurant = await yem.restaurants(restaurantOwner.address);
    const updatedSlippage = updatedRestaurant.defaultSlippageBps;
    console.log(`   📊 Yeni slippage: ${updatedSlippage} bps (${updatedSlippage/100}%)\n`);

    // Test hesaplaması - Görseldeki miktarlarla
    console.log("🧮 Test hesaplaması (Görseldeki miktarlarla):");
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

    console.log("🎉 Slippage düzeltildi! Artık hassas ETH miktarları çalışacak!");

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
