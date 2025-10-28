// scripts/register-test-restaurant.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer, restaurant, customer] = await ethers.getSigners();

  // Deploy output'dan güncel adresleri oku
  const fs = require("fs");
  const deployOutput = JSON.parse(fs.readFileSync("./deploy-output.json", "utf8"));
  const YEMEK = deployOutput.YemekSepeti;
  const FOOD = deployOutput.FOOD;

  console.log("🔍 Test Restoran Kaydı...\n");
  
  // Kontratları bağla
  const yem = await ethers.getContractAt("YemekSepeti", YEMEK);
  
  console.log("✅ Kontratlar bağlandı");
  console.log("🔍 Restaurant address:", restaurant.address);
  console.log("🔍 Customer address:", customer.address);
  
  // 1. Restoran kaydı
  console.log("\n=== RESTORAN KAYDI ===");
  try {
    await yem.connect(restaurant).registerRestaurant("Test Restoran - Adana Kebap");
    console.log("✅ Restoran kaydedildi");
  } catch (error) {
    if (error.message.includes("already registered")) {
      console.log("ℹ️  Restoran zaten kayıtlı");
    } else {
      console.log("❌ Restoran kayıt hatası:", error.message);
    }
  }
  
  // 2. Müşteri kaydı
  console.log("\n=== MÜŞTERİ KAYDI ===");
  try {
    await yem.connect(customer).registerCustomer("Test Müşteri");
    console.log("✅ Müşteri kaydedildi");
  } catch (error) {
    if (error.message.includes("already registered")) {
      console.log("ℹ️  Müşteri zaten kayıtlı");
    } else {
      console.log("❌ Müşteri kayıt hatası:", error.message);
    }
  }
  
  // 3. Menü fiyatları
  console.log("\n=== MENÜ FİYATLARI ===");
  try {
    await yem.connect(restaurant).setMenuPriceQuote("Adana Kebap", 8900000, 6); // $8.90
    console.log("✅ Adana Kebap: $8.90");
  } catch (error) {
    console.log("ℹ️  Adana Kebap fiyatı zaten ayarlı");
  }
  
  // 4. FOOD token kabul
  console.log("\n=== TOKEN KABUL ===");
  try {
    await yem.connect(restaurant).setAcceptedToken("Adana Kebap", FOOD, true);
    console.log("✅ FOOD token kabul edildi");
  } catch (error) {
    console.log("ℹ️  FOOD token zaten kabul edilmiş");
  }
  
  // 5. Kontrol
  console.log("\n=== KONTROL ===");
  try {
    const restaurantData = await yem.restaurants(restaurant.address);
    console.log("📊 Restoran verisi:", {
      walletAddress: restaurantData.walletAddress,
      realWorldAddress: restaurantData.realWorldAddress
    });
    
    if (restaurantData.walletAddress !== ethers.constants.AddressZero) {
      console.log("✅ Restoran başarıyla kayıtlı!");
    } else {
      console.log("❌ Restoran kaydı başarısız");
    }
  } catch (error) {
    console.log("❌ Kontrol hatası:", error.message);
  }
  
  console.log("\n🔍 Test restoran kaydı tamamlandı!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test hatası:", error);
    process.exit(1);
  });
