const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔄 Cüzdan Adresleri Güncelleniyor...\n");

  // Deploy output'dan kontrat adreslerini oku
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
  
  console.log(`📋 Kontrat adresleri:`);
  console.log(`   YemekSepeti: ${YEMEKSEPETI_ADDRESS}\n`);

  // BELİRTİLEN ADRESLER
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

  console.log("🔄 Cüzdan adresleri güncelleniyor...\n");

  try {
    // Mevcut durumu kontrol et
    console.log(`🔍 Mevcut Durum:`);
    
    const customerData = await yem.customers(CUSTOMER_ADDR);
    const restaurantData = await yem.restaurants(RESTAURANT_ADDR);
    
    console.log(`   👤 Customer (${CUSTOMER_ADDR}): ${customerData.walletAddress !== ethers.constants.AddressZero ? "✅ Kayıtlı" : "❌ Kayıtlı değil"}`);
    console.log(`   🏪 Restaurant (${RESTAURANT_ADDR}): ${restaurantData.walletAddress !== ethers.constants.AddressZero ? "✅ Kayıtlı" : "❌ Kayıtlı değil"}`);

    // Restaurant cüzdanının customer olarak kayıtlı olup olmadığını kontrol et
    const restaurantAsCustomer = await yem.customers(RESTAURANT_ADDR);
    const isRestaurantAsCustomer = restaurantAsCustomer.walletAddress !== ethers.constants.AddressZero;
    
    if (isRestaurantAsCustomer) {
      console.log(`\n⚠️  UYARI: Restaurant cüzdanı customer olarak da kayıtlı!`);
      console.log(`   🔧 Bu durumu düzeltmemiz gerekiyor.`);
      
      // Customer kaydını kaldır (sadece owner yapabilir)
      console.log(`\n🗑️ Restaurant cüzdanından customer kaydı kaldırılıyor...`);
      try {
        const removeTx = await yem.connect(owner).removeCustomer(RESTAURANT_ADDR);
        await removeTx.wait();
        console.log(`   ✅ Customer kaydı kaldırıldı!`);
      } catch (error) {
        console.log(`   ❌ Customer kaydı kaldırılamadı: ${error.message}`);
      }
    }

    // Customer cüzdanının restaurant olarak kayıtlı olup olmadığını kontrol et
    const customerAsRestaurant = await yem.restaurants(CUSTOMER_ADDR);
    const isCustomerAsRestaurant = customerAsRestaurant.walletAddress !== ethers.constants.AddressZero;
    
    if (isCustomerAsRestaurant) {
      console.log(`\n⚠️  UYARI: Customer cüzdanı restaurant olarak da kayıtlı!`);
      console.log(`   🔧 Bu durumu düzeltmemiz gerekiyor.`);
      
      // Restaurant kaydını kaldır (sadece owner yapabilir)
      console.log(`\n🗑️ Customer cüzdanından restaurant kaydı kaldırılıyor...`);
      try {
        const removeTx = await yem.connect(owner).removeRestaurant(CUSTOMER_ADDR);
        await removeTx.wait();
        console.log(`   ✅ Restaurant kaydı kaldırıldı!`);
      } catch (error) {
        console.log(`   ❌ Restaurant kaydı kaldırılamadı: ${error.message}`);
      }
    }

    // Güncellenmiş durumu kontrol et
    console.log(`\n🔍 Güncellenmiş Durum:`);
    
    const updatedCustomerData = await yem.customers(CUSTOMER_ADDR);
    const updatedRestaurantData = await yem.restaurants(RESTAURANT_ADDR);
    const updatedRestaurantAsCustomer = await yem.customers(RESTAURANT_ADDR);
    const updatedCustomerAsRestaurant = await yem.restaurants(CUSTOMER_ADDR);
    
    console.log(`   👤 Customer (${CUSTOMER_ADDR}): ${updatedCustomerData.walletAddress !== ethers.constants.AddressZero ? "✅ Kayıtlı" : "❌ Kayıtlı değil"}`);
    console.log(`   🏪 Restaurant (${RESTAURANT_ADDR}): ${updatedRestaurantData.walletAddress !== ethers.constants.AddressZero ? "✅ Kayıtlı" : "❌ Kayıtlı değil"}`);
    console.log(`   🔒 Restaurant customer olarak: ${updatedRestaurantAsCustomer.walletAddress !== ethers.constants.AddressZero ? "❌ Evet (SORUN!)" : "✅ Hayır (MÜKEMMEL!)"}`);
    console.log(`   🔒 Customer restaurant olarak: ${updatedCustomerAsRestaurant.walletAddress !== ethers.constants.AddressZero ? "❌ Evet (SORUN!)" : "✅ Hayır (MÜKEMMEL!)"}`);

    // Özet
    console.log(`\n📊 ÖZET:`);
    console.log(`   👤 Customer kayıtlı: ${updatedCustomerData.walletAddress !== ethers.constants.AddressZero ? "✅ Evet" : "❌ Hayır"}`);
    console.log(`   🏪 Restaurant kayıtlı: ${updatedRestaurantData.walletAddress !== ethers.constants.AddressZero ? "✅ Evet" : "❌ Hayır"}`);
    console.log(`   🔒 Restaurant customer olarak: ${updatedRestaurantAsCustomer.walletAddress !== ethers.constants.AddressZero ? "❌ Evet" : "✅ Hayır"}`);
    console.log(`   🔒 Customer restaurant olarak: ${updatedCustomerAsRestaurant.walletAddress !== ethers.constants.AddressZero ? "❌ Evet" : "✅ Hayır"}`);

    // Durum değerlendirmesi
    console.log(`\n🔍 DURUM DEĞERLENDİRMESİ:`);
    
    if (updatedCustomerData.walletAddress !== ethers.constants.AddressZero && 
        updatedRestaurantData.walletAddress !== ethers.constants.AddressZero && 
        updatedRestaurantAsCustomer.walletAddress === ethers.constants.AddressZero && 
        updatedCustomerAsRestaurant.walletAddress === ethers.constants.AddressZero) {
      console.log(`   🎉 MÜKEMMEL! Cüzdan adresleri başarıyla güncellendi!`);
      console.log(`   💡 Frontend'de kullanım:`);
      console.log(`      🍽️  Müşteri olarak: ${CUSTOMER_ADDR}`);
      console.log(`      🏪 Restoran sahibi olarak: ${RESTAURANT_ADDR}`);
    } else {
      console.log(`   ⚠️  HALA DÜZELTİLMESİ GEREKEN SORUNLAR VAR!`);
      
      if (updatedCustomerData.walletAddress === ethers.constants.AddressZero) {
        console.log(`      ❌ Customer kayıtlı değil!`);
      }
      if (updatedRestaurantData.walletAddress === ethers.constants.AddressZero) {
        console.log(`      ❌ Restaurant kayıtlı değil!`);
      }
      if (updatedRestaurantAsCustomer.walletAddress !== ethers.constants.AddressZero) {
        console.log(`      ❌ Restaurant cüzdanı hala customer olarak kayıtlı!`);
      }
      if (updatedCustomerAsRestaurant.walletAddress !== ethers.constants.AddressZero) {
        console.log(`      ❌ Customer cüzdanı hala restaurant olarak kayıtlı!`);
      }
    }

    console.log("\n🎉 Cüzdan adres güncelleme işlemi tamamlandı!");

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
