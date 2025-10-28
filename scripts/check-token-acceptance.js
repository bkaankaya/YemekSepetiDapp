const { ethers } = require("hardhat");

async function checkTokenAcceptance() {
  try {
    // Deploy output'u oku
    const fs = require('fs');
    const deployOutput = JSON.parse(fs.readFileSync('./deploy-output.json', 'utf8'));
    
    const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
    const FOOD_TOKEN_ADDRESS = deployOutput.FOOD;
    const RESTAURANT_ADDR = "0x01b56546769f424F18d5931303c7E1a4fCE1422B";
    
    console.log("🔍 Token Kabul Durumu Kontrol Ediliyor...");
    console.log("YemekSepeti:", YEMEKSEPETI_ADDRESS);
    console.log("FOOD Token:", FOOD_TOKEN_ADDRESS);
    console.log("Restoran:", RESTAURANT_ADDR);
    
    // YemekSepeti kontratını al
    const yem = await ethers.getContractAt("YemekSepeti", YEMEKSEPETI_ADDRESS);
    
    // Restoran verilerini kontrol et
    console.log("\n📋 Restoran Verileri:");
    const restaurantData = await yem.restaurants(RESTAURANT_ADDR);
    console.log("Restoran Adı:", restaurantData.name);
    console.log("Wallet Address:", restaurantData.walletAddress);
    console.log("Is Active:", restaurantData.isActive);
    
    // FOOD token'ın kabul edilip edilmediğini kontrol et
    console.log("\n🍽️ Token Kabul Durumu:");
    const isTokenAccepted = await yem.acceptedTokens(FOOD_TOKEN_ADDRESS);
    console.log("FOOD Token Kabul Ediliyor:", isTokenAccepted);
    
    // Oracle'dan FOOD token fiyatını kontrol et
    console.log("\n💰 Oracle Fiyat Kontrolü:");
    const oracle = await ethers.getContractAt("Oracle", deployOutput.Oracle);
    try {
      const tokenPrice = await oracle.getTokenPrice(FOOD_TOKEN_ADDRESS);
      console.log("FOOD Token Fiyatı:", ethers.utils.formatUnits(tokenPrice, 18), "USD");
    } catch (error) {
      console.log("❌ FOOD Token fiyatı Oracle'da bulunamadı!");
    }
    
    // ETH fiyatını da kontrol et
    try {
      const ethPrice = await oracle.getEthPrice();
      console.log("ETH Fiyatı:", ethers.utils.formatUnits(ethPrice, 18), "USD");
    } catch (error) {
      console.log("❌ ETH fiyatı Oracle'da bulunamadı!");
    }
    
  } catch (error) {
    console.error("❌ Hata:", error.message);
  }
}

checkTokenAcceptance()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
