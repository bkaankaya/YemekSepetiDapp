const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🏪 Kullanıcı Sistemi Kuruluyor...\n");

  // Deploy output'dan kontrat adreslerini oku
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
  const FOOD_TOKEN_ADDRESS = deployOutput.FOOD;
  
  console.log(`📋 Kontrat adresleri:`);
  console.log(`   YemekSepeti: ${YEMEKSEPETI_ADDRESS}`);
  console.log(`   FOOD Token: ${FOOD_TOKEN_ADDRESS}\n`);

  // Signer'ları al
  const [owner, customer] = await ethers.getSigners();
  
  console.log(`👤 Kullanıcı adresleri:`);
  console.log(`   Owner/Restaurant: ${owner.address}`);
  console.log(`   Customer: ${customer.address} (Siz - sipariş vereceksiniz)\n`);

  // YemekSepeti kontratını bağla
  const YemekSepeti = await ethers.getContractFactory("YemekSepeti");
  const yem = YemekSepeti.attach(YEMEKSEPETI_ADDRESS);

  // FOOD token kontratını bağla (ERC20 interface kullan)
  const FOOD_ABI = [
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
    "function approve(address,uint256) returns (bool)"
  ];
  const food = new ethers.Contract(FOOD_TOKEN_ADDRESS, FOOD_ABI, owner);

  console.log("🔐 Müşteri kaydı yapılıyor...\n");

  try {
    // Customer'ı kaydet (Siz)
    console.log(`📝 Customer kaydediliyor: ${customer.address}`);
    const customerTx = await yem.connect(customer).registerCustomer("İstanbul, Kadıköy");
    await customerTx.wait();
    console.log(`   ✅ Customer kaydedildi!`);

    console.log("\n🏪 Restoranlar kaydediliyor...\n");

    // Türkiye'den bilindik restoran isimleri
    const restaurants = [
      {
        name: "Kebapçı Selim",
        address: "İstanbul, Kadıköy",
        categories: ["Kebap", "Izgara", "Salata", "Çorba", "Tatlı"],
        menu: [
          { name: "Adana Kebap", price: 8900, decimals: 2, description: "Acılı, lavaş ile" },
          { name: "Urfa Kebap", price: 8900, decimals: 2, description: "Orta acı, lavaş ile" },
          { name: "Tavuk Şiş", price: 7500, decimals: 2, description: "Marine edilmiş tavuk" },
          { name: "Çoban Salata", price: 3200, decimals: 2, description: "Domates, soğan, biber" },
          { name: "Mercimek Çorbası", price: 2800, decimals: 2, description: "Sıcak, taze" },
          { name: "Ayran", price: 2000, decimals: 2, description: "Taze, soğuk" },
          { name: "Baklava", price: 4500, decimals: 2, description: "Fıstıklı, şerbetli" }
        ]
      },
      {
        name: "Pizza Roma",
        address: "İstanbul, Beşiktaş",
        categories: ["Pizza", "Salata", "Ekmek", "Tatlı", "İçecek"],
        menu: [
          { name: "Margherita Pizza", price: 12000, decimals: 2, description: "Domates, mozzarella, fesleğen" },
          { name: "Pepperoni Pizza", price: 14000, decimals: 2, description: "Pepperoni, mozzarella" },
          { name: "Hawaiian Pizza", price: 15000, decimals: 2, description: "Jambon, ananas, mozzarella" },
          { name: "Caesar Salata", price: 4500, decimals: 2, description: "Marul, parmesan, kruton" },
          { name: "Garlic Bread", price: 2500, decimals: 2, description: "Sarımsaklı ekmek" },
          { name: "Tiramisu", price: 3500, decimals: 2, description: "İtalyan tatlısı" },
          { name: "Limonata", price: 2000, decimals: 2, description: "Taze limonata" }
        ]
      },
      {
        name: "Burger House",
        address: "İstanbul, Şişli",
        categories: ["Burger", "Patates", "Salata", "İçecek", "Tatlı"],
        menu: [
          { name: "Classic Burger", price: 8500, decimals: 2, description: "Dana eti, marul, domates" },
          { name: "Cheese Burger", price: 9500, decimals: 2, description: "Dana eti, cheddar, marul" },
          { name: "Chicken Burger", price: 7500, decimals: 2, description: "Tavuk göğsü, marul" },
          { name: "Patates Kızartması", price: 3000, decimals: 2, description: "Çıtır çıtır patates" },
          { name: "Garden Salata", price: 4000, decimals: 2, description: "Karışık yeşillik" },
          { name: "Cola", price: 2500, decimals: 2, description: "Soğuk cola" },
          { name: "Milk Shake", price: 3500, decimals: 2, description: "Çikolata milkshake" }
        ]
      },
      {
        name: "Sushi Bar",
        address: "İstanbul, Nişantaşı",
        categories: ["Sushi", "Ramen", "Salata", "Tatlı", "İçecek"],
        menu: [
          { name: "California Roll", price: 18000, decimals: 2, description: "Avokado, yengeç, salatalık" },
          { name: "Salmon Nigiri", price: 12000, decimals: 2, description: "Somon, pirinç" },
          { name: "Tuna Roll", price: 16000, decimals: 2, description: "Ton balığı, avokado" },
          { name: "Miso Çorbası", price: 3500, decimals: 2, description: "Geleneksel miso" },
          { name: "Seaweed Salata", price: 4500, decimals: 2, description: "Deniz yosunu salatası" },
          { name: "Mochi", price: 2500, decimals: 2, description: "Japon tatlısı" },
          { name: "Yeşil Çay", price: 1500, decimals: 2, description: "Sıcak yeşil çay" }
        ]
      },
      {
        name: "Tatlıcı Gül",
        address: "İstanbul, Fatih",
        categories: ["Tatlı", "Kahve", "Çay", "Dondurma", "İçecek"],
        menu: [
          { name: "Künefe", price: 5500, decimals: 2, description: "Antep fıstıklı künefe" },
          { name: "Baklava", price: 4500, decimals: 2, description: "Fıstıklı baklava" },
          { name: "Kazandibi", price: 4000, decimals: 2, description: "Geleneksel kazandibi" },
          { name: "Türk Kahvesi", price: 2500, decimals: 2, description: "Geleneksel Türk kahvesi" },
          { name: "Çay", price: 1000, decimals: 2, description: "Demli çay" },
          { name: "Dondurma", price: 3000, decimals: 2, description: "Vanilya dondurma" },
          { name: "Şerbet", price: 2000, decimals: 2, description: "Gül şerbeti" }
        ]
      },
      {
        name: "Kahve Dünyası",
        address: "İstanbul, Beyoğlu",
        categories: ["Kahve", "Çay", "Tatlı", "Sandviç", "İçecek"],
        menu: [
          { name: "Espresso", price: 2000, decimals: 2, description: "Tek shot espresso" },
          { name: "Cappuccino", price: 3500, decimals: 2, description: "Sütlü kahve" },
          { name: "Latte", price: 4000, decimals: 2, description: "Sütlü kahve" },
          { name: "Türk Çayı", price: 1000, decimals: 2, description: "Demli çay" },
          { name: "Cheesecake", price: 4500, decimals: 2, description: "New York cheesecake" },
          { name: "Sandviç", price: 5500, decimals: 2, description: "Tavuklu sandviç" },
          { name: "Smoothie", price: 3000, decimals: 2, description: "Meyve smoothie" }
        ]
      },
      {
        name: "Pasta Evi",
        address: "İstanbul, Kadıköy",
        categories: ["Pasta", "Risotto", "Salata", "Tatlı", "İçecek"],
        menu: [
          { name: "Spaghetti Carbonara", price: 9500, decimals: 2, description: "Yumurta, peynir, pastırma" },
          { name: "Fettuccine Alfredo", price: 11000, decimals: 2, description: "Krema, parmesan" },
          { name: "Mushroom Risotto", price: 12000, decimals: 2, description: "Mantar risotto" },
          { name: "Caesar Salata", price: 4500, decimals: 2, description: "Marul, parmesan, kruton" },
          { name: "Tiramisu", price: 3500, decimals: 2, description: "İtalyan tatlısı" },
          { name: "Bruschetta", price: 3000, decimals: 2, description: "Domates, fesleğen" },
          { name: "Limonata", price: 2000, decimals: 2, description: "Taze limonata" }
        ]
      },
      {
        name: "Tavuk Dünyası",
        address: "İstanbul, Beşiktaş",
        categories: ["Tavuk", "Burger", "Yan Ürün", "Salata", "İçecek"],
        menu: [
          { name: "Fried Chicken", price: 9500, decimals: 2, description: "Çıtır tavuk" },
          { name: "Chicken Wings", price: 8500, decimals: 2, description: "Tavuk kanat" },
          { name: "Chicken Burger", price: 9000, decimals: 2, description: "Tavuk burger" },
          { name: "Patates Kızartması", price: 3000, decimals: 2, description: "Çıtır patates" },
          { name: "Coleslaw Salata", price: 2500, decimals: 2, description: "Lahana salatası" },
          { name: "Cola", price: 2500, decimals: 2, description: "Soğuk cola" },
          { name: "Ice Tea", price: 2000, decimals: 2, description: "Soğuk çay" }
        ]
      }
    ];

    // Her restoranı kaydet
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      console.log(`📝 ${restaurant.name} kaydediliyor...`);
      
      // Restoranı kaydet
      const restaurantTx = await yem.connect(owner).registerRestaurant(restaurant.address);
      await restaurantTx.wait();
      
      // Menü fiyatlarını ayarla
      for (const menuItem of restaurant.menu) {
        await yem.connect(owner).setMenuPriceQuote(
          menuItem.name, 
          menuItem.price, 
          menuItem.decimals
        );
        
        // FOOD token'ı kabul et
        await yem.connect(owner).setAcceptedToken(
          menuItem.name, 
          FOOD_TOKEN_ADDRESS, 
          true
        );
      }
      
      console.log(`   ✅ ${restaurant.name} kaydedildi ve menüsü ayarlandı!`);
    }

    console.log("\n🔍 Sistem kontrol ediliyor...\n");

    // Customer kaydını kontrol et
    const customerData = await yem.customers(customer.address);
    console.log(`👤 Customer (${customer.address}):`);
    console.log(`   📍 Adres: ${customerData.realWorldAddress}`);
    console.log(`   🆔 Kayıtlı: ${customerData.walletAddress !== ethers.constants.AddressZero ? "✅ Evet" : "❌ Hayır"}`);

    // Restoranları kontrol et
    console.log(`\n🏪 Restoranlar:`);
    for (const restaurant of restaurants) {
      const restaurantData = await yem.restaurants(owner.address);
      console.log(`   ✅ ${restaurant.name}: ${restaurantData.realWorldAddress}`);
    }

    console.log("\n🎉 Kullanıcı sistemi kuruldu!");
    console.log("\n💡 Frontend'de kullanım:");
    console.log(`   🍽️  Müşteri olarak: ${customer.address}`);
    console.log(`   🏪 Restoran sahibi olarak: ${owner.address}`);
    console.log(`\n📱 Frontend: http://localhost:5174/`);

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
