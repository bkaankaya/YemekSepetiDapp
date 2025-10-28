const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔐 Hem Müşteri Hem Restoran Kaydı Yapılıyor...\n");

  // Deploy output'dan kontrat adreslerini oku
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
  
  console.log(`📋 Kontrat adresleri:`);
  console.log(`   YemekSepeti: ${YEMEKSEPETI_ADDRESS}\n`);

  // BELİRTİLEN ADRESLER
  const CUSTOMER_ADDRESS = "0x12D7c52D054959698c9c8496732BBe6c22706C39";
  const RESTAURANT_ADDRESS = "0x01b56546769f424F18d5931303c7E1a4fCE1422B";
  
  // Signer'ları al (Hardhat config sırasına göre)
  const [restaurantOwner, admin, customer] = await ethers.getSigners();
  
  console.log(`👤 Kullanıcı adresleri:`);
  console.log(`   Restaurant Owner (Index 0): ${restaurantOwner.address} (${RESTAURANT_ADDRESS})`);
  console.log(`   Admin (Index 1): ${admin.address}`);
  console.log(`   Customer (Index 2): ${customer.address} (${CUSTOMER_ADDRESS})\n`);

  // YemekSepeti kontratını bağla
  const YemekSepeti = await ethers.getContractFactory("YemekSepeti");
  const yem = YemekSepeti.attach(YEMEKSEPETI_ADDRESS);

  console.log("🔐 Kayıtlar yapılıyor...\n");

  try {
    // Customer'ı kaydet
    console.log(`📝 Customer kaydediliyor: ${CUSTOMER_ADDRESS}`);
    const customerTx = await yem.connect(customer).registerCustomer("İstanbul, Kadıköy");
    await customerTx.wait();
    console.log(`   ✅ Customer kaydedildi!`);

    // Restaurant Owner'ı restoran olarak kaydet
    console.log(`📝 Restaurant Owner kaydediliyor: ${RESTAURANT_ADDRESS}`);
    const restaurantTx = await yem.connect(restaurantOwner).registerRestaurant("İstanbul, Merkez");
    await restaurantTx.wait();
    console.log(`   ✅ Restaurant Owner restoran olarak kaydedildi!`);

    console.log("\n🔍 Sistem kontrol ediliyor...\n");

    // Customer kaydını kontrol et
    const customerData = await yem.customers(CUSTOMER_ADDRESS);
    console.log(`👤 Customer (${CUSTOMER_ADDRESS}):`);
    console.log(`   📍 Adres: ${customerData.realWorldAddress}`);
    console.log(`   🆔 Kayıtlı: ${customerData.walletAddress !== ethers.constants.AddressZero ? "✅ Evet" : "❌ Hayır"}`);

    // Restaurant kaydını kontrol et
    const restaurantData = await yem.restaurants(RESTAURANT_ADDRESS);
    console.log(`\n🏪 Restaurant Owner (${RESTAURANT_ADDRESS}):`);
    console.log(`   📍 Adres: ${restaurantData.realWorldAddress}`);
    console.log(`   🆔 Kayıtlı: ${restaurantData.walletAddress !== ethers.constants.AddressZero ? "✅ Evet" : "❌ Hayır"}`);

    console.log("\n🎉 Tüm kayıtlar tamamlandı!");
    console.log("\n💡 Frontend'de kullanım:");
    console.log(`   🍽️  Müşteri olarak: ${CUSTOMER_ADDRESS}`);
    console.log(`   🏪 Restoran sahibi olarak: ${RESTAURANT_ADDRESS}`);
    console.log(`\n📱 Frontend: http://localhost:5175/`);

  } catch (error) {
    console.error("❌ Hata:", error.message);
    
    if (error.message.includes("already registered")) {
      console.log("\n💡 Bu cüzdan zaten kayıtlı!");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 