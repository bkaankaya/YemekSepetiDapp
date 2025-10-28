const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔍 Yeni Signer'lar Kontrol Ediliyor...\n");

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

  console.log("🔍 Yeni signer'lar kontrol ediliyor...\n");

  try {
    // Signer'ların adreslerini kontrol et
    console.log(`🔑 Signer Adresleri:`);
    console.log(`   👑 Owner: ${owner.address}`);
    console.log(`   🏪 Restaurant Owner: ${restaurantOwner.address}`);
    console.log(`   👤 Customer: ${customer.address}`);

    // Beklenen adreslerle karşılaştır
    console.log(`\n🎯 Beklenen Adresler:`);
    console.log(`   🏪 Restaurant: ${RESTAURANT_ADDR}`);
    console.log(`   👤 Customer: ${CUSTOMER_ADDR}`);

    // Adres eşleşmelerini kontrol et
    console.log(`\n✅ Adres Eşleşmeleri:`);
    
    const restaurantMatch = restaurantOwner.address.toLowerCase() === RESTAURANT_ADDR.toLowerCase();
    const customerMatch = customer.address.toLowerCase() === CUSTOMER_ADDR.toLowerCase();
    
    console.log(`   🏪 Restaurant: ${restaurantMatch ? "✅ Eşleşiyor" : "❌ Eşleşmiyor"}`);
    console.log(`   👤 Customer: ${customerMatch ? "✅ Eşleşiyor" : "❌ Eşleşmiyor"}`);

    // Customer kaydını kontrol et
    console.log(`\n👤 Customer Kayıt Durumu:`);
    const customerData = await yem.customers(CUSTOMER_ADDR);
    const isCustomerRegistered = customerData.walletAddress !== ethers.constants.AddressZero;
    console.log(`   🆔 Kayıtlı: ${isCustomerRegistered ? "✅ Evet" : "❌ Hayır"}`);
    if (isCustomerRegistered) {
      console.log(`   📍 Adres: ${customerData.realWorldAddress}`);
    }

    // Restaurant kaydını kontrol et
    console.log(`\n🏪 Restaurant Kayıt Durumu:`);
    const restaurantData = await yem.restaurants(RESTAURANT_ADDR);
    const isRestaurantRegistered = restaurantData.walletAddress !== ethers.constants.AddressZero;
    console.log(`   🆔 Kayıtlı: ${isRestaurantRegistered ? "✅ Evet" : "❌ Hayır"}`);
    if (isRestaurantRegistered) {
      console.log(`   📍 Adres: ${restaurantData.realWorldAddress}`);
    }

    // Restaurant cüzdanının customer olarak kayıtlı olmadığını kontrol et
    console.log(`\n🔍 Restaurant cüzdanı customer olarak kayıtlı mı?`);
    const restaurantAsCustomer = await yem.customers(RESTAURANT_ADDR);
    const isRestaurantAsCustomer = restaurantAsCustomer.walletAddress !== ethers.constants.AddressZero;
    console.log(`   🆔 Customer olarak kayıtlı: ${isRestaurantAsCustomer ? "❌ Evet (SORUN!)" : "✅ Hayır (MÜKEMMEL!)"}`);

    // Özet
    console.log(`\n📊 ÖZET:`);
    console.log(`   🔑 Restaurant signer eşleşmesi: ${restaurantMatch ? "✅ Evet" : "❌ Hayır"}`);
    console.log(`   🔑 Customer signer eşleşmesi: ${customerMatch ? "✅ Evet" : "❌ Hayır"}`);
    console.log(`   👤 Customer kayıtlı: ${isCustomerRegistered ? "✅ Evet" : "❌ Hayır"}`);
    console.log(`   🏪 Restaurant kayıtlı: ${isRestaurantRegistered ? "✅ Evet" : "❌ Hayır"}`);
    console.log(`   🔒 Restaurant customer olarak: ${isRestaurantAsCustomer ? "❌ Evet" : "✅ Hayır"}`);

    // Durum değerlendirmesi
    console.log(`\n🔍 DURUM DEĞERLENDİRMESİ:`);
    
    if (restaurantMatch && customerMatch && isCustomerRegistered && isRestaurantRegistered && !isRestaurantAsCustomer) {
      console.log(`   🎉 MÜKEMMEL! Tüm signer'lar doğru şekilde ayarlanmış!`);
      console.log(`   💡 Frontend'de kullanım:`);
      console.log(`      🍽️  Müşteri olarak: ${CUSTOMER_ADDR}`);
      console.log(`      🏪 Restoran sahibi olarak: ${RESTAURANT_ADDR}`);
    } else {
      console.log(`   ⚠️  DÜZELTİLMESİ GEREKEN SORUNLAR VAR!`);
      
      if (!restaurantMatch) {
        console.log(`      ❌ Restaurant signer adresi eşleşmiyor!`);
      }
      if (!customerMatch) {
        console.log(`      ❌ Customer signer adresi eşleşmiyor!`);
      }
      if (!isCustomerRegistered) {
        console.log(`      ❌ Customer kayıtlı değil!`);
      }
      if (!isRestaurantRegistered) {
        console.log(`      ❌ Restaurant kayıtlı değil!`);
      }
      if (isRestaurantAsCustomer) {
        console.log(`      ❌ Restaurant cüzdanı customer olarak da kayıtlı!`);
      }
    }

    console.log("\n🎉 Yeni signer kontrolü tamamlandı!");

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
