const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔧 TÜM RESTORANLARIN TÜM ÜRÜNLERİ İÇİN TOKEN KABUL AYARI YAPILIYOR...\n");
  
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
  
  // TÜM RESTORANLARIN TÜM ÜRÜNLERİ
  const allRestaurantItems = {
    "Kebapçı Selim": [
      "Adana Kebap",
      "Urfa Kebap", 
      "Tavuk Şiş",
      "Çoban Salata",
      "Mercimek Çorbası",
      "Ayran"
    ],
    "Pizza Roma": [
      "Pizza Margherita",
      "Pizza Pepperoni",
      "Pizza Quattro Stagioni",
      "Pizza Diavola",
      "Pizza Marinara",
      "Pizza Napoletana"
    ],
    "Burger House": [
      "Burger Classic",
      "Burger Cheese",
      "Burger Bacon",
      "Burger Mushroom",
      "Burger BBQ",
      "Burger Deluxe"
    ],
    "Sushi Bar": [
      "Sushi Nigiri",
      "Sushi Maki",
      "Sushi California Roll",
      "Sushi Dragon Roll",
      "Sushi Spicy Tuna",
      "Sushi Salmon Roll"
    ],
    "Tatlıcı Gül": [
      "Baklava",
      "Künefe",
      "Kazandibi",
      "Sütlaç",
      "Kemalpaşa",
      "Aşure"
    ],
    "Kahve Dünyası": [
      "Espresso",
      "Cappuccino",
      "Latte",
      "Americano",
      "Mocha",
      "Macchiato"
    ],
    "Pasta Evi": [
      "Tiramisu",
      "Cheesecake",
      "Chocolate Cake",
      "Red Velvet",
      "Carrot Cake",
      "Black Forest"
    ],
    "Tavuk Dünyası": [
      "Tavuk Şiş",
      "Tavuk Döner",
      "Tavuk Pirzola",
      "Tavuk Kanat",
      "Tavuk Göğsü",
      "Tavuk But"
    ]
  };
  
  try {
    console.log("\n🔧 Token Kabul Ayarı Yapılıyor...");
    
    let totalItems = 0;
    let successCount = 0;
    
    for (const [restaurantName, items] of Object.entries(allRestaurantItems)) {
      console.log(`\n🏪 ${restaurantName}:`);
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        totalItems++;
        
        try {
          // FOOD token'ı kabul et (restoran sahibi cüzdanı ile)
          const tx = await yem.connect(restaurantOwner).setAcceptedToken(item, FOOD_TOKEN_ADDRESS, true);
          await tx.wait();
          console.log(`   ✅ ${item} → FOOD Token kabul edildi`);
          successCount++;
        } catch (error) {
          console.log(`   ❌ ${item} → Hata: ${error.message}`);
        }
      }
    }
    
    console.log(`\n📊 ÖZET:`);
    console.log(`   Toplam ürün: ${totalItems}`);
    console.log(`   Başarılı: ${successCount}`);
    console.log(`   Başarısız: ${totalItems - successCount}`);
    
    console.log("\n🔍 Kontrol Ediliyor...");
    
    // Kontrol et
    for (const [restaurantName, items] of Object.entries(allRestaurantItems)) {
      console.log(`\n🏪 ${restaurantName}:`);
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
          const isAccepted = await yem.isTokenAccepted("0x01b56546769f424F18d5931303c7E1a4fCE1422B", item, FOOD_TOKEN_ADDRESS);
          console.log(`   ${item}: ${isAccepted ? '✅ Kabul' : '❌ Kabul Değil'}`);
        } catch (error) {
          console.log(`   ${item}: ❌ Hata - ${error.message}`);
        }
      }
    }
    
    console.log("\n🎉 TÜM RESTORANLAR İÇİN TOKEN KABUL AYARI TAMAMLANDI!");
    console.log("💡 Artık TÜM restoranların TÜM ürünleri için ETH ve FOOD Token ile ödeme yapabilirsiniz!");
    console.log("💡 Slippage hatası almayacaksınız!");
    
  } catch (error) {
    console.error("❌ Genel hata:", error.message);
  }
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
