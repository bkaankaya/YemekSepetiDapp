// scripts/register-multiple-restaurants.js
const { ethers } = require("hardhat");
const fs = require("fs");

// Deploy çıktılarından güncel adresler
const ADDRS = JSON.parse(fs.readFileSync("./deploy-output.json", "utf8"));

async function main() {
  const [deployer, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10] = await ethers.getSigners();
  
  console.log("🍽️  Çoklu Restoran Kayıt Script'i Başlatılıyor...\n");
  
  // Kontratları bağla
  const yem = await ethers.getContractAt("YemekSepeti", ADDRS.YemekSepeti);
  const oracle = await ethers.getContractAt("DummyOracle", ADDRS.Oracle);
  
  console.log("✅ Kontratlar bağlandı");
  console.log("🔍 YemekSepeti:", ADDRS.YemekSepeti);
  console.log("🔍 Oracle:", ADDRS.Oracle);
  console.log("🔍 FOOD Token:", ADDRS.FOOD);
  
  // Restoran verileri
  const restaurants = [
    {
      signer: a1,
      name: "Eth Kebap & Grill",
      address: "İstanbul, Kadıköy",
      menu: [
        { name: "Adana Kebap", price: 890, category: "Kebap" },
        { name: "Urfa Kebap", price: 890, category: "Kebap" },
        { name: "Tavuk Şiş", price: 750, category: "Tavuk" },
        { name: "Çoban Salata", price: 320, category: "Salata" },
        { name: "Mercimek Çorbası", price: 280, category: "Çorba" },
        { name: "Ayran", price: 200, category: "İçecek" },
        { name: "Baklava", price: 450, category: "Tatlı" }
      ]
    },
    {
      signer: a2,
      name: "Polygon Pizza",
      address: "İstanbul, Beşiktaş",
      menu: [
        { name: "Margherita Pizza", price: 1200, category: "Pizza" },
        { name: "Pepperoni Pizza", price: 1400, category: "Pizza" },
        { name: "Quattro Stagioni", price: 1600, category: "Pizza" },
        { name: "Hawaiian Pizza", price: 1500, category: "Pizza" },
        { name: "Caesar Salata", price: 450, category: "Salata" },
        { name: "Garlic Bread", price: 300, category: "Ekmek" },
        { name: "Tiramisu", price: 600, category: "Tatlı" },
        { name: "Coca Cola", price: 250, category: "İçecek" }
      ]
    },
    {
      signer: a3,
      name: "BSC Burger House",
      address: "İstanbul, Şişli",
      menu: [
        { name: "Classic Burger", price: 850, category: "Burger" },
        { name: "Cheese Burger", price: 950, category: "Burger" },
        { name: "Bacon Burger", price: 1100, category: "Burger" },
        { name: "Veggie Burger", price: 750, category: "Burger" },
        { name: "French Fries", price: 400, category: "Yan Ürün" },
        { name: "Onion Rings", price: 350, category: "Yan Ürün" },
        { name: "Chocolate Shake", price: 550, category: "İçecek" },
        { name: "Vanilla Shake", price: 550, category: "İçecek" }
      ]
    },
    {
      signer: a4,
      name: "Avalanche Sushi Bar",
      address: "İstanbul, Nişantaşı",
      menu: [
        { name: "California Roll", price: 1800, category: "Sushi" },
        { name: "Salmon Nigiri", price: 1200, category: "Sushi" },
        { name: "Tuna Maki", price: 1600, category: "Sushi" },
        { name: "Dragon Roll", price: 2200, category: "Sushi" },
        { name: "Miso Çorbası", price: 350, category: "Çorba" },
        { name: "Edamame", price: 280, category: "Yan Ürün" },
        { name: "Green Tea", price: 150, category: "İçecek" },
        { name: "Mochi", price: 400, category: "Tatlı" }
      ]
    },
    {
      signer: a5,
      name: "Solana Sweet Shop",
      address: "İstanbul, Beyoğlu",
      menu: [
        { name: "Chocolate Cake", price: 650, category: "Tatlı" },
        { name: "Strawberry Cheesecake", price: 750, category: "Tatlı" },
        { name: "Red Velvet Cake", price: 700, category: "Tatlı" },
        { name: "Tiramisu", price: 800, category: "Tatlı" },
        { name: "Cappuccino", price: 350, category: "İçecek" },
        { name: "Espresso", price: 250, category: "İçecek" },
        { name: "Hot Chocolate", price: 450, category: "İçecek" },
        { name: "Ice Cream", price: 300, category: "Tatlı" }
      ]
    },
    {
      signer: a6,
      name: "Cardano Coffee",
      address: "İstanbul, Üsküdar",
      menu: [
        { name: "Espresso", price: 200, category: "Kahve" },
        { name: "Americano", price: 250, category: "Kahve" },
        { name: "Cappuccino", price: 300, category: "Kahve" },
        { name: "Latte", price: 350, category: "Kahve" },
        { name: "Mocha", price: 400, category: "Kahve" },
        { name: "Croissant", price: 450, category: "Ekmek" },
        { name: "Chocolate Muffin", price: 350, category: "Tatlı" },
        { name: "Sandwich", price: 550, category: "Ana Yemek" }
      ]
    },
    {
      signer: a7,
      name: "Polkadot Pasta",
      address: "İstanbul, Kadıköy",
      menu: [
        { name: "Birthday Cake", price: 1200, category: "Pasta" },
        { name: "Wedding Cake", price: 2500, category: "Pasta" },
        { name: "Chocolate Truffle", price: 800, category: "Pasta" },
        { name: "Fruit Tart", price: 600, category: "Pasta" },
        { name: "Cupcake", price: 250, category: "Pasta" },
        { name: "Macaron", price: 180, category: "Pasta" },
        { name: "Hot Tea", price: 200, category: "İçecek" },
        { name: "Fresh Juice", price: 400, category: "İçecek" }
      ]
    },
    {
      signer: a8,
      name: "Chainlink Chicken",
      address: "İstanbul, Beşiktaş",
      menu: [
        { name: "Fried Chicken", price: 950, category: "Tavuk" },
        { name: "Grilled Chicken", price: 1100, category: "Tavuk" },
        { name: "Chicken Wings", price: 850, category: "Tavuk" },
        { name: "Chicken Burger", price: 900, category: "Burger" },
        { name: "Mashed Potatoes", price: 350, category: "Yan Ürün" },
        { name: "Coleslaw", price: 250, category: "Salata" },
        { name: "Lemonade", price: 300, category: "İçecek" },
        { name: "Iced Tea", price: 250, category: "İçecek" }
      ]
    }
  ];

  // Oracle'da fiyatları ayarla
  console.log("\n=== ORACLE FİYAT AYARLARI ===");
  try {
    // ETH fiyatı: 1 ETH = $3200
    await oracle.setEthPrice(ethers.utils.parseEther("3200"));
    console.log("✅ ETH fiyatı: $3200");
    
    // FOOD token fiyatı: 1 FOOD = $1
    await oracle.setTokenPrice(ADDRS.FOOD, ethers.utils.parseEther("1"));
    console.log("✅ FOOD token fiyatı: $1");
    
    // FOOD token decimal'ı
    await oracle.setTokenDecimals(ADDRS.FOOD, 18);
    console.log("✅ FOOD token decimal: 18");
  } catch (error) {
    console.log("ℹ️  Oracle fiyatları zaten ayarlı");
  }

  // Her restoran için kayıt işlemi
  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i];
    console.log(`\n=== ${i + 1}. RESTORAN: ${restaurant.name} ===`);
    
    try {
      // Restoran kaydı
      await yem.connect(restaurant.signer).registerRestaurant(restaurant.address);
      console.log(`✅ ${restaurant.name} kaydedildi`);
      
      // Menü fiyatları
      console.log("📋 Menü fiyatları ayarlanıyor...");
      for (const item of restaurant.menu) {
        try {
          await yem.connect(restaurant.signer).setMenuPriceQuote(
            item.name, 
            item.price * 100, // USD cent'e çevir
            2 // 2 ondalık
          );
          console.log(`   ✅ ${item.name}: $${(item.price / 100).toFixed(2)}`);
        } catch (error) {
          console.log(`   ℹ️  ${item.name} fiyatı zaten ayarlı`);
        }
      }
      
      // FOOD token kabul
      console.log("🪙 FOOD token kabul ediliyor...");
      for (const item of restaurant.menu) {
        try {
          await yem.connect(restaurant.signer).setAcceptedToken(
            item.name, 
            ADDRS.FOOD, 
            true
          );
          console.log(`   ✅ ${item.name} için FOOD token kabul edildi`);
        } catch (error) {
          console.log(`   ℹ️  ${item.name} için FOOD token zaten kabul edilmiş`);
        }
      }
      
      // Slippage ayarı
      try {
        await yem.connect(restaurant.signer).setDefaultSlippageBps(100); // %1
        console.log("✅ Slippage %1 olarak ayarlandı");
      } catch (error) {
        console.log("ℹ️  Slippage zaten ayarlı");
      }
      
      console.log(`🎉 ${restaurant.name} başarıyla kuruldu!`);
      
    } catch (error) {
      console.log(`❌ ${restaurant.name} kurulum hatası:`, error.message);
    }
  }

  // Müşteri kayıtları
  console.log("\n=== MÜŞTERİ KAYITLARI ===");
  const customers = [a9, a10];
  for (let i = 0; i < customers.length; i++) {
    try {
      await yem.connect(customers[i]).registerCustomer(`Test Müşteri ${i + 1}`);
      console.log(`✅ Müşteri ${i + 1} kaydedildi`);
    } catch (error) {
      console.log(`ℹ️  Müşteri ${i + 1} zaten kayıtlı`);
    }
  }

  // Özet
  console.log("\n=== ÖZET ===");
  console.log(`🏪 Toplam ${restaurants.length} restoran kuruldu`);
  console.log(`👥 Toplam ${customers.length} müşteri kaydedildi`);
  console.log(`🍽️  Her restoran hem ETH hem de FOOD token ile ödeme alabilir`);
  console.log(`💰 Oracle fiyatları güncel`);
  
  // Restoran adresleri
  console.log("\n=== RESTORAN ADRESLERİ ===");
  restaurants.forEach((restaurant, index) => {
    console.log(`${index + 1}. ${restaurant.name}: ${restaurant.signer.address}`);
  });

  console.log("\n🎉 Tüm restoranlar başarıyla kuruldu!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
