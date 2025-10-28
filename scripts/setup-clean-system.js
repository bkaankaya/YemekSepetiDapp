const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🏪 Temiz Sistem Kuruluyor...\n");

  // Deploy output'dan kontrat adreslerini oku
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
  const FOOD_TOKEN_ADDRESS = deployOutput.FOOD;
  
  console.log(`📋 Kontrat adresleri:`);
  console.log(`   YemekSepeti: ${YEMEKSEPETI_ADDRESS}`);
  console.log(`   FOOD Token: ${FOOD_TOKEN_ADDRESS}\n`);

  // Signer'ları al
  const [owner, restaurantOwner, customer] = await ethers.getSigners();
  
  console.log(`👤 Kullanıcı adresleri:`);
  console.log(`   Owner: ${owner.address} (Customer olarak kayıt edilecek)`);
  console.log(`   Restaurant Owner: ${restaurantOwner.address} (Restoran olarak kayıt edilecek)`);
  console.log(`   Customer: ${customer.address} (Kullanılmayacak)\n`);

  // YemekSepeti kontratını bağla
  const YemekSepeti = await ethers.getContractFactory("YemekSepeti");
  const yem = YemekSepeti.attach(YEMEKSEPETI_ADDRESS);

  console.log("🔐 Müşteri kaydı yapılıyor...\n");

  try {
    // Customer'ı kaydet (Siz)
    console.log(`📝 Customer kaydediliyor: ${owner.address}`);
    const customerTx = await yem.connect(owner).registerCustomer("İstanbul, Kadıköy");
    await customerTx.wait();
    console.log(`   ✅ Customer kaydedildi!`);

    console.log("\n🏪 Restoran sahibi kaydı yapılıyor...\n");

    // Restaurant Owner'ı restoran olarak kaydet
    console.log(`📝 Restaurant Owner kaydediliyor: ${restaurantOwner.address}`);
    const restaurantTx = await yem.connect(restaurantOwner).registerRestaurant("İstanbul, Merkez");
    await restaurantTx.wait();
    console.log(`   ✅ Restaurant Owner restoran olarak kaydedildi!`);

    console.log("\n🏪 Restoranlar kaydediliyor...\n");

    // Türkiye'den bilindik restoran isimleri
    const restaurants = [
      {
        name: "Kebapçı Selim",
        address: "İstanbul, Kadıköy",
        menu: [
          { name: "Adana Kebap", price: 8900, decimals: 2 },
          { name: "Urfa Kebap", price: 8900, decimals: 2 },
          { name: "Tavuk Şiş", price: 7500, decimals: 2 },
          { name: "Çoban Salata", price: 3200, decimals: 2 },
          { name: "Mercimek Çorbası", price: 2800, decimals: 2 },
          { name: "Ayran", price: 2000, decimals: 2 },
          { name: "Baklava", price: 4500, decimals: 2 }
        ]
      },
      {
        name: "Pizza Roma",
        address: "İstanbul, Beşiktaş",
        menu: [
          { name: "Margherita Pizza", price: 12000, decimals: 2 },
          { name: "Pepperoni Pizza", price: 14000, decimals: 2 },
          { name: "Hawaiian Pizza", price: 15000, decimals: 2 },
          { name: "Caesar Salata", price: 4500, decimals: 2 },
          { name: "Garlic Bread", price: 2500, decimals: 2 },
          { name: "Tiramisu", price: 3500, decimals: 2 },
          { name: "Limonata", price: 2000, decimals: 2 }
        ]
      },
      {
        name: "Burger House",
        address: "İstanbul, Şişli",
        menu: [
          { name: "Classic Burger", price: 8500, decimals: 2 },
          { name: "Cheese Burger", price: 9500, decimals: 2 },
          { name: "Chicken Burger", price: 7500, decimals: 2 },
          { name: "Patates Kızartması", price: 3000, decimals: 2 },
          { name: "Garden Salata", price: 4000, decimals: 2 },
          { name: "Cola", price: 2500, decimals: 2 },
          { name: "Milk Shake", price: 3500, decimals: 2 }
        ]
      },
      {
        name: "Sushi Bar",
        address: "İstanbul, Nişantaşı",
        menu: [
          { name: "California Roll", price: 18000, decimals: 2 },
          { name: "Salmon Nigiri", price: 12000, decimals: 2 },
          { name: "Tuna Roll", price: 16000, decimals: 2 },
          { name: "Miso Çorbası", price: 3500, decimals: 2 },
          { name: "Seaweed Salata", price: 4500, decimals: 2 },
          { name: "Mochi", price: 2500, decimals: 2 },
          { name: "Yeşil Çay", price: 1500, decimals: 2 }
        ]
      },
      {
        name: "Tatlıcı Gül",
        address: "İstanbul, Fatih",
        menu: [
          { name: "Künefe", price: 5500, decimals: 2 },
          { name: "Baklava", price: 4500, decimals: 2 },
          { name: "Kazandibi", price: 4000, decimals: 2 },
          { name: "Türk Kahvesi", price: 2500, decimals: 2 },
          { name: "Çay", price: 1000, decimals: 2 },
          { name: "Dondurma", price: 3000, decimals: 2 },
          { name: "Şerbet", price: 2000, decimals: 2 }
        ]
      },
      {
        name: "Kahve Dünyası",
        address: "İstanbul, Beyoğlu",
        menu: [
          { name: "Espresso", price: 2000, decimals: 2 },
          { name: "Cappuccino", price: 3500, decimals: 2 },
          { name: "Latte", price: 4000, decimals: 2 },
          { name: "Türk Çayı", price: 1000, decimals: 2 },
          { name: "Cheesecake", price: 4500, decimals: 2 },
          { name: "Sandviç", price: 5500, decimals: 2 },
          { name: "Smoothie", price: 3000, decimals: 2 }
        ]
      },
      {
        name: "Pasta Evi",
        address: "İstanbul, Kadıköy",
        menu: [
          { name: "Spaghetti Carbonara", price: 9500, decimals: 2 },
          { name: "Fettuccine Alfredo", price: 11000, decimals: 2 },
          { name: "Mushroom Risotto", price: 12000, decimals: 2 },
          { name: "Caesar Salata", price: 4500, decimals: 2 },
          { name: "Tiramisu", price: 3500, decimals: 2 },
          { name: "Bruschetta", price: 3000, decimals: 2 },
          { name: "Limonata", price: 2000, decimals: 2 }
        ]
      },
      {
        name: "Tavuk Dünyası",
        address: "İstanbul, Beşiktaş",
        menu: [
          { name: "Fried Chicken", price: 9500, decimals: 2 },
          { name: "Chicken Wings", price: 8500, decimals: 2 },
          { name: "Chicken Burger", price: 9000, decimals: 2 },
          { name: "Patates Kızartması", price: 3000, decimals: 2 },
          { name: "Coleslaw Salata", price: 2500, decimals: 2 },
          { name: "Cola", price: 2500, decimals: 2 },
          { name: "Ice Tea", price: 2000, decimals: 2 }
        ]
      }
    ];

    // Her restoranı kaydet
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      console.log(`📝 ${restaurant.name} kaydediliyor...`);
      
      // Menü fiyatlarını ayarla
      for (const menuItem of restaurant.menu) {
        await yem.connect(restaurantOwner).setMenuPriceQuote(
          menuItem.name, 
          menuItem.price, 
          menuItem.decimals
        );
        
        // FOOD token'ı kabul et
        await yem.connect(restaurantOwner).setAcceptedToken(
          menuItem.name, 
          FOOD_TOKEN_ADDRESS, 
          true
        );
      }
      
      console.log(`   ✅ ${restaurant.name} menüsü ayarlandı!`);
    }

    console.log("\n🔍 Sistem kontrol ediliyor...\n");

    // Customer kaydını kontrol et
    const customerData = await yem.customers(owner.address);
    console.log(`👤 Customer (${owner.address}):`);
    console.log(`   📍 Adres: ${customerData.realWorldAddress}`);
    console.log(`   🆔 Kayıtlı: ${customerData.walletAddress !== ethers.constants.AddressZero ? "✅ Evet" : "❌ Hayır"}`);

    // Restaurant kaydını kontrol et
    const restaurantData = await yem.restaurants(restaurantOwner.address);
    console.log(`\n🏪 Restaurant Owner (${restaurantOwner.address}):`);
    console.log(`   📍 Adres: ${restaurantData.realWorldAddress}`);
    console.log(`   🆔 Kayıtlı: ${restaurantData.walletAddress !== ethers.constants.AddressZero ? "✅ Evet" : "❌ Hayır"}`);

    // Restaurant cüzdanının customer olarak kayıtlı olmadığını kontrol et
    const restaurantAsCustomer = await yem.customers(restaurantOwner.address);
    const isRestaurantAsCustomer = restaurantAsCustomer.walletAddress !== ethers.constants.AddressZero;
    console.log(`\n🔍 Restaurant cüzdanı customer olarak kayıtlı mı?`);
    console.log(`   🆔 Customer olarak kayıtlı: ${isRestaurantAsCustomer ? "❌ Evet (SORUN!)" : "✅ Hayır (MÜKEMMEL!)"}`);

    console.log("\n🎉 Temiz sistem kuruldu!");
    console.log("\n💡 Frontend'de kullanım:");
    console.log(`   🍽️  Müşteri olarak: ${owner.address} (SİZ)`);
    console.log(`   🏪 Restoran sahibi olarak: ${restaurantOwner.address} (Restoran paneline girebilir)`);
    console.log(`\n📱 Frontend: http://localhost:5175/`);
    console.log(`\n🔑 Restoran paneline girmek için MetaMask'ta ${restaurantOwner.address} adresini seçin!`);

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
