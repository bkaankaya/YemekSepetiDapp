// scripts/seed.js
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🌱 Sistem Seed Verisi Yükleniyor...\n");

  // Deploy output'dan kontrat adreslerini oku
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
  const FOOD_TOKEN_ADDRESS = deployOutput.FOOD;
  
  console.log(`📋 Kontrat adresleri:`);
  console.log(`   YemekSepeti: ${YEMEKSEPETI_ADDRESS}`);
  console.log(`   FOOD Token: ${FOOD_TOKEN_ADDRESS}\n`);

  // DOĞRU ADRESLER - setup-final-system.js ile aynı
  const CUSTOMER_ADDR = "0x12D7c52D054959698c9c8496732BBe6c22706C39";
  const RESTAURANT_ADDR = "0x01b56546769f424F18d5931303c7E1a4fCE1422B";

  // Signer'ları al
  const [owner, restaurantOwner, customer] = await ethers.getSigners();
  
  console.log(`👤 Kullanıcı adresleri:`);
  console.log(`   Owner: ${owner.address}`);
  console.log(`   Restaurant Owner: ${restaurantOwner.address} (${RESTAURANT_ADDR})`);
  console.log(`   Customer: ${customer.address} (${CUSTOMER_ADDR})\n`);

  // YemekSepeti kontratını bağla
  const YemekSepeti = await ethers.getContractFactory("YemekSepeti");
  const yem = YemekSepeti.attach(YEMEKSEPETI_ADDRESS);

  console.log("🔐 Kullanıcı kayıtları yapılıyor...\n");

  try {
    // Customer'ı kaydet (owner signer ile çünkü adres aynı)
    console.log(`📝 Customer kaydediliyor: ${CUSTOMER_ADDR}`);
    const customerTx = await yem.connect(owner).registerCustomer("İstanbul, Kadıköy");
    await customerTx.wait();
    console.log(`   ✅ Customer kaydedildi!`);

    // Restaurant Owner'ı restoran olarak kaydet
    console.log(`📝 Restaurant Owner kaydediliyor: ${RESTAURANT_ADDR}`);
    const restaurantTx = await yem.connect(restaurantOwner).registerRestaurant("İstanbul, Merkez");
    await restaurantTx.wait();
    console.log(`   ✅ Restaurant Owner restoran olarak kaydedildi!`);

    console.log("\n🏪 Restoranlar kaydediliyor...\n");

    // Türkiye'den bilindik restoran isimleri - setup-final-system.js ile aynı fiyatlar
    const restaurants = [
      {
        name: "Kebapçı Selim",
        address: "İstanbul, Kadıköy",
        menu: [
          { name: "Adana Kebap", price: "12.50", decimals: 18 },
          { name: "Urfa Kebap", price: "11.50", decimals: 18 },
          { name: "Tavuk Şiş", price: "9.50", decimals: 18 },
          { name: "Çoban Salata", price: "4.50", decimals: 18 },
          { name: "Mercimek Çorbası", price: "3.50", decimals: 18 },
          { name: "Ayran", price: "2.00", decimals: 18 }
        ]
      },
      {
        name: "Pizza Roma",
        address: "İstanbul, Beşiktaş",
        menu: [
          { name: "Pizza Margherita", price: "15.00", decimals: 18 },
          { name: "Pizza Pepperoni", price: "17.00", decimals: 18 },
          { name: "Caesar Salata", price: "8.00", decimals: 18 },
          { name: "Tiramisu", price: "6.00", decimals: 18 }
        ]
      }
    ];

    // Her restoranı kaydet
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      console.log(`📝 ${restaurant.name} kaydediliyor...`);
      
      // Menü fiyatlarını ayarla
      for (const menuItem of restaurant.menu) {
        const priceInWei = ethers.utils.parseEther(menuItem.price);
        await yem.connect(restaurantOwner).setMenuPriceQuote(
          menuItem.name, 
          priceInWei, 
          menuItem.decimals
        );
        
        // FOOD token'ı kabul et
        await yem.connect(restaurantOwner).setAcceptedToken(
          menuItem.name, 
          FOOD_TOKEN_ADDRESS, 
          true
        );

        // ETH ödemesini de kabul et (kritik!)
        await yem.connect(restaurantOwner).setAcceptedToken(
          menuItem.name, 
          ethers.constants.AddressZero, 
          true
        );
      }
      
      console.log(`   ✅ ${restaurant.name} menüsü ayarlandı!`);
    }

    console.log("\n🔍 Sistem kontrol ediliyor...\n");

    // Customer kaydını kontrol et
    const customerData = await yem.customers(CUSTOMER_ADDR);
    console.log(`👤 Customer (${CUSTOMER_ADDR}):`);
    console.log(`   📍 Adres: ${customerData.realWorldAddress}`);
    console.log(`   🆔 Kayıtlı: ${customerData.walletAddress !== ethers.constants.AddressZero ? "✅ Evet" : "❌ Hayır"}`);

    // Restaurant kaydını kontrol et
    const restaurantData = await yem.restaurants(RESTAURANT_ADDR);
    console.log(`\n🏪 Restaurant Owner (${RESTAURANT_ADDR}):`);
    console.log(`   📍 Adres: ${restaurantData.realWorldAddress}`);
    console.log(`   🆔 Kayıtlı: ${restaurantData.walletAddress !== ethers.constants.AddressZero ? "✅ Evet" : "❌ Hayır"}`);

    console.log("\n🎉 Seed verisi yüklendi!");
    console.log("\n💡 Frontend'de kullanım:");
    console.log(`   🍽️  Müşteri olarak: ${CUSTOMER_ADDR}`);
    console.log(`   🏪 Restoran sahibi olarak: ${RESTAURANT_ADDR}`);

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
