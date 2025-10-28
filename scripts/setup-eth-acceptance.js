const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔧 ETH Acceptance Ayarları Yapılıyor...\n");

  // Deploy output'dan kontrat adreslerini oku
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
  
  console.log(`📋 Kontrat adresleri:`);
  console.log(`   YemekSepeti: ${YEMEKSEPETI_ADDRESS}\n`);

  // Yeni adresler
  const RESTAURANT_ADDR = "0x01b56546769f424F18d5931303c7E1a4fCE1422B";

  // Signer'ları al
  const [owner, restaurantOwner] = await ethers.getSigners();
  
  console.log(`👤 Restaurant Owner: ${restaurantOwner.address}`);

  // YemekSepeti kontratını bağla
  const YemekSepeti = await ethers.getContractFactory("YemekSepeti");
  const yem = YemekSepeti.attach(YEMEKSEPETI_ADDRESS);

  // Restaurant owner ile bağla
  const yemAsRestaurant = yem.connect(restaurantOwner);

  try {
    console.log(`🔧 ETH Acceptance Ayarlanıyor...\n`);

    // Menü ürünleri listesi
    const menuItems = [
      "Adana Kebap",
      "Lahmacun", 
      "Pide",
      "Urfa Kebap",
      "Tavuk Şiş",
      "Çoban Salata",
      "Mercimek Çorbası",
      "Ayran",
      "Pizza Margherita",
      "Pizza Pepperoni",
      "Pizza Quattro Stagioni",
      "Pizza Diavola",
      "Pizza Marinara",
      "Pizza Napoletana",
      "Burger Classic",
      "Burger Cheese",
      "Burger Bacon",
      "Burger Mushroom",
      "Burger BBQ",
      "Burger Deluxe",
      "Sushi Nigiri",
      "Sushi Maki",
      "Sushi California Roll",
      "Sushi Dragon Roll",
      "Sushi Spicy Tuna",
      "Sushi Salmon Roll",
      "Baklava",
      "Künefe",
      "Kazandibi",
      "Sütlaç",
      "Kemalpaşa",
      "Aşure",
      "Espresso",
      "Cappuccino",
      "Latte",
      "Americano",
      "Mocha",
      "Macchiato",
      "Tiramisu",
      "Cheesecake",
      "Chocolate Cake",
      "Red Velvet",
      "Carrot Cake",
      "Black Forest",
      "Tavuk Döner",
      "Tavuk Pirzola",
      "Tavuk Kanat",
      "Tavuk Göğsü",
      "Tavuk But"
    ];

    let successCount = 0;
    let failCount = 0;

    // Her ürün için ETH kabul ayarla (address(0) = ETH)
    for (const item of menuItems) {
      try {
        console.log(`   ⏳ ${item} → ETH kabul ayarlanıyor...`);
        
        const tx = await yemAsRestaurant.setAcceptedToken(
          item,
          ethers.constants.AddressZero, // address(0) = ETH
          true // kabul et
        );
        
        await tx.wait();
        console.log(`   ✅ ${item} → ETH kabul edildi`);
        successCount++;
      } catch (error) {
        console.log(`   ❌ ${item} → Hata: ${error.message}`);
        failCount++;
      }
    }

    console.log(`\n📊 ÖZET:`);
    console.log(`   Toplam ürün: ${menuItems.length}`);
    console.log(`   Başarılı: ${successCount}`);
    console.log(`   Başarısız: ${failCount}`);

    console.log(`\n🔍 Kontrol Ediliyor...\n`);

    // Birkaç ürün için kontrol et
    const testItems = ["Adana Kebap", "Pizza Margherita", "Burger Classic"];
    
    for (const item of testItems) {
      try {
        const isAccepted = await yem.isTokenAccepted(
          restaurantOwner.address,
          item,
          ethers.constants.AddressZero
        );
        console.log(`   ${item}: ${isAccepted ? '✅ Kabul' : '❌ Kabul Değil'}`);
      } catch (error) {
        console.log(`   ${item}: ❌ Kontrol hatası`);
      }
    }

    console.log(`\n🎉 ETH ACCEPTANCE AYARI TAMAMLANDI!`);
    console.log(`💡 Artık tüm ürünler için ETH ile ödeme yapabilirsiniz!`);
    
  } catch (error) {
    console.error("❌ Hata:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
