const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔧 Tüm Ürünler İçin Token Kabul Ayarı Yapılıyor...\n");
  
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
  const FOOD_TOKEN_ADDRESS = deployOutput.FOOD;
  
  console.log("📋 Kontrat adresleri:");
  console.log(`   YemekSepeti: ${YEMEKSEPETI_ADDRESS}`);
  console.log(`   FOOD Token: ${FOOD_TOKEN_ADDRESS}`);
  
  const [owner] = await ethers.getSigners();
  
  // Restoran sahibi cüzdanını al
  const restaurantOwner = new ethers.Wallet("0x01b56546769f424F18d5931303c7E1a4fCE1422B", owner.provider);
  
  console.log("\n👤 Restaurant Owner: 0x01b56546769f424F18d5931303c7E1a4fCE1422B");
  
  const YemekSepeti = await ethers.getContractFactory("YemekSepeti");
  const yem = YemekSepeti.attach(YEMEKSEPETI_ADDRESS);
  
  // Tüm ürünler için token kabul ayarı
  const allItems = [
    "Adana Kebap",
    "Urfa Kebap", 
    "Tavuk Şiş",
    "Çoban Salata",
    "Mercimek Çorbası",
    "Ayran",
    "Pizza Margherita",
    "Pizza Pepperoni",
    "Burger Classic",
    "Burger Cheese",
    "Sushi Nigiri",
    "Sushi Maki",
    "Baklava",
    "Künefe",
    "Espresso",
    "Cappuccino",
    "Tiramisu",
    "Cheesecake",
    "Tavuk Şiş",
    "Tavuk Döner"
  ];
  
  try {
    console.log("\n🔧 Token Kabul Ayarı Yapılıyor...");
    
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      try {
        // FOOD token'ı kabul et (restoran sahibi cüzdanı ile)
        const tx = await yem.connect(restaurantOwner).setAcceptedToken(item, FOOD_TOKEN_ADDRESS, true);
        await tx.wait();
        console.log(`   ✅ ${item} → FOOD Token kabul edildi`);
      } catch (error) {
        console.log(`   ❌ ${item} → Hata: ${error.message}`);
      }
    }
    
    console.log("\n🔍 Kontrol Ediliyor...");
    
    // Kontrol et
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      try {
        const isAccepted = await yem.isTokenAccepted("0x01b56546769f424F18d5931303c7E1a4fCE1422B", item, FOOD_TOKEN_ADDRESS);
        console.log(`   ${item}: ${isAccepted ? '✅ Kabul' : '❌ Kabul Değil'}`);
      } catch (error) {
        console.log(`   ${item}: ❌ Hata - ${error.message}`);
      }
    }
    
    console.log("\n🎉 Token Kabul Ayarı Tamamlandı!");
    console.log("💡 Artık tüm ürünler için ETH ve FOOD Token ile ödeme yapabilirsiniz!");
    
  } catch (error) {
    console.error("❌ Genel hata:", error.message);
  }
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
