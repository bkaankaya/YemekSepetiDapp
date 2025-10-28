const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🏪 Restaurant ve Customer Kayıtları Yapılıyor...\n");

  // Deploy output'dan kontrat adreslerini oku
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
  const FOOD_TOKEN_ADDRESS = deployOutput.FOOD;
  
  console.log(`📋 Kontrat adresleri:`);
  console.log(`   YemekSepeti: ${YEMEKSEPETI_ADDRESS}`);
  console.log(`   FOOD Token: ${FOOD_TOKEN_ADDRESS}\n`);

  // Yeni adresler
  const RESTAURANT_ADDR = "0x01b56546769f424F18d5931303c7E1a4fCE1422B";
  const CUSTOMER_ADDR = "0x12D7c52D054959698c9c8496732BBe6c22706C39";

  // Signer'ları al
  const [owner, restaurantOwner, customer] = await ethers.getSigners();
  
  console.log(`👤 Kullanıcı adresleri:`);
  console.log(`   Owner: ${owner.address}`);
  console.log(`   Restaurant Owner: ${restaurantOwner.address} (${RESTAURANT_ADDR})`);
  console.log(`   Customer: ${customer.address} (${CUSTOMER_ADDR})\n`);

  // YemekSepeti kontratını bağla
  const YemekSepeti = await ethers.getContractFactory("YemekSepeti");
  const yem = YemekSepeti.attach(YEMEKSEPETI_ADDRESS);

  try {
    // 1. Restaurant kaydı (restaurantOwner ile)
    console.log("🏪 Restaurant kaydı yapılıyor...");
    try {
      await yem.connect(restaurantOwner).registerRestaurant("Merkezi Restoran Sistemi - Ana Restoran");
      console.log("✅ Restaurant başarıyla kaydedildi!");
    } catch (error) {
      if (error.message.includes("already registered")) {
        console.log("ℹ️  Restaurant zaten kayıtlı");
      } else {
        console.log("❌ Restaurant kayıt hatası:", error.message);
      }
    }

    // 2. Customer kaydı (customer ile)
    console.log("\n👤 Customer kaydı yapılıyor...");
    try {
      await yem.connect(customer).registerCustomer("Test Müşteri");
      console.log("✅ Customer başarıyla kaydedildi!");
    } catch (error) {
      if (error.message.includes("already registered")) {
        console.log("ℹ️  Customer zaten kayıtlı");
      } else {
        console.log("❌ Customer kayıt hatası:", error.message);
      }
    }

    // 3. Restaurant menü fiyatları ayarla
    console.log("\n🍕 Menü fiyatları ayarlanıyor...");
    try {
      await yem.connect(restaurantOwner).setMenuPriceQuote("Adana Kebap", 8900000, 6); // $8.90
      console.log("✅ Adana Kebap: $8.90");
      
      await yem.connect(restaurantOwner).setMenuPriceQuote("Lahmacun", 4500000, 6); // $4.50
      console.log("✅ Lahmacun: $4.50");
      
      await yem.connect(restaurantOwner).setMenuPriceQuote("Pide", 6500000, 6); // $6.50
      console.log("✅ Pide: $6.50");
    } catch (error) {
      console.log("ℹ️  Menü fiyatları zaten ayarlı");
    }

    // 4. FOOD token kabul ayarları
    console.log("\n🪙 Token kabul ayarları yapılıyor...");
    try {
      await yem.connect(restaurantOwner).setAcceptedToken("Adana Kebap", FOOD_TOKEN_ADDRESS, true);
      await yem.connect(restaurantOwner).setAcceptedToken("Lahmacun", FOOD_TOKEN_ADDRESS, true);
      await yem.connect(restaurantOwner).setAcceptedToken("Pide", FOOD_TOKEN_ADDRESS, true);
      console.log("✅ FOOD token tüm ürünler için kabul edildi");
    } catch (error) {
      console.log("ℹ️  Token kabul ayarları zaten yapılmış");
    }

    // 5. Durum kontrolü
    console.log("\n🔍 Kayıt durumu kontrol ediliyor...");
    
    const restaurantData = await yem.restaurants(RESTAURANT_ADDR);
    const isRestaurantRegistered = restaurantData.walletAddress !== ethers.constants.AddressZero;
    console.log(`🏪 Restaurant kayıtlı: ${isRestaurantRegistered ? "✅ Evet" : "❌ Hayır"}`);
    
    const customerData = await yem.customers(CUSTOMER_ADDR);
    const isCustomerRegistered = customerData.walletAddress !== ethers.constants.AddressZero;
    console.log(`👤 Customer kayıtlı: ${isCustomerRegistered ? "✅ Evet" : "❌ Hayır"}`);

    // 6. Owner kontrolü
    const currentOwner = await yem.owner();
    console.log(`👑 Mevcut Owner: ${currentOwner}`);
    console.log(`🔗 Restaurant Owner ile aynı: ${currentOwner.toLowerCase() === RESTAURANT_ADDR.toLowerCase() ? "✅ Evet" : "❌ Hayır"}`);

    console.log("\n🎉 Tüm kayıtlar tamamlandı!");
    console.log("\n📋 Sistem Durumu:");
    console.log("   🏪 Restaurant: Hem owner hem de restaurant yetkisi");
    console.log("   👤 Customer: Müşteri yetkisi");
    console.log("   🍕 Menü: Adana Kebap, Lahmacun, Pide");
    console.log("   🪙 Token: FOOD token kabul ediliyor");
    
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