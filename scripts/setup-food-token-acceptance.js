const { ethers } = require("hardhat");

async function setupFoodTokenAcceptance() {
  try {
    // Deploy output'u oku
    const fs = require('fs');
    const deployOutput = JSON.parse(fs.readFileSync('./deploy-output.json', 'utf8'));
    
    const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
    const FOOD_TOKEN_ADDRESS = deployOutput.FOOD;
    const RESTAURANT_ADDR = "0x01b56546769f424F18d5931303c7E1a4fCE1422B";
    
    console.log("🍽️ FOOD Token Kabul Durumu Ayarlanıyor...");
    
    // Restoran sahibi olarak işlem yap
    const restaurantSigner = await ethers.getSigner(1); // Index 1 = Restaurant
    console.log("Restoran Cüzdanı:", await restaurantSigner.getAddress());
    
    // YemekSepeti kontratını al
    const yem = await ethers.getContractAt("YemekSepeti", YEMEKSEPETI_ADDRESS);
    
    // FOOD token'ı tüm menü öğeleri için kabul edilen tokenlar listesine ekle
    console.log("FOOD token kabul ediliyor...");
    
    // Önce mevcut menü öğelerini al
    const restaurantData = await yem.restaurants(RESTAURANT_ADDR);
    console.log("Restoran Adı:", restaurantData.name);
    
    // Test için "Adana Kebap" öğesi için FOOD token'ı kabul et
    const itemName = "Adana Kebap";
    const tx = await yem.connect(restaurantSigner).setAcceptedToken(itemName, FOOD_TOKEN_ADDRESS, true);
    await tx.wait();
    console.log("✅ FOOD token 'Adana Kebap' için kabul edildi! TX:", tx.hash);
    
    // Kontrol et
    const isAccepted = await yem.isTokenAcceptedForItem(RESTAURANT_ADDR, itemName, FOOD_TOKEN_ADDRESS);
    console.log("Kontrol - FOOD Token 'Adana Kebap' için Kabul Ediliyor:", isAccepted);
    
  } catch (error) {
    console.error("❌ Hata:", error.message);
  }
}

setupFoodTokenAcceptance()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });