// scripts/check-restaurant-status.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Restoran Durumu Kontrol Ediliyor...\n");

  // Contract adresleri
  const YEMEK = "0x2bdCC0de6bE1f7D2ee689a0342D76F52E8EFABa3";

  // Signer'ları al
  const [owner, restaurantOwner, customer] = await ethers.getSigners();
  
  console.log(`👤 Kullanıcı adresleri:`);
  console.log(`   Owner: ${owner.address}`);
  console.log(`   Restaurant Owner: ${restaurantOwner.address}\n`);

  // YemekSepeti kontratını bağla
  const yem = await ethers.getContractAt("YemekSepeti", YEMEK);

  try {
    // Restoran durumunu kontrol et
    console.log("🔍 Restoran durumu kontrol ediliyor...");
    const restaurant = await yem.restaurants(restaurantOwner.address);
    
    console.log(`   📍 Real World Address: ${restaurant.realWorldAddress}`);
    console.log(`   🆔 Wallet Address: ${restaurant.walletAddress}`);
    console.log(`   📊 Default Slippage: ${restaurant.defaultSlippageBps} bps (${restaurant.defaultSlippageBps/100}%)`);
    
    if (restaurant.walletAddress === ethers.constants.AddressZero) {
      console.log(`   ❌ Restoran kayıtlı değil!`);
    } else {
      console.log(`   ✅ Restoran kayıtlı!`);
    }
    
    // Restoran kayıt fonksiyonunu çağır
    console.log("\n🔧 Restoran kaydı yapılıyor...");
    const tx = await yem.connect(restaurantOwner).registerRestaurant("İstanbul, Merkez");
    console.log(`   ✅ Transaction gönderildi: ${tx.hash}`);
    await tx.wait();
    console.log(`   ✅ Restoran kaydedildi!\n`);
    
    // Tekrar kontrol et
    console.log("🔍 Güncellenmiş restoran durumu:");
    const updatedRestaurant = await yem.restaurants(restaurantOwner.address);
    
    console.log(`   📍 Real World Address: ${updatedRestaurant.realWorldAddress}`);
    console.log(`   🆔 Wallet Address: ${updatedRestaurant.walletAddress}`);
    console.log(`   📊 Default Slippage: ${updatedRestaurant.defaultSlippageBps} bps (${updatedRestaurant.defaultSlippageBps/100}%)`);
    
    if (updatedRestaurant.walletAddress === ethers.constants.AddressZero) {
      console.log(`   ❌ Hala kayıtlı değil!`);
    } else {
      console.log(`   ✅ Artık kayıtlı!`);
    }

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
