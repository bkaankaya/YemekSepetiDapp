const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔐 Kullanıcı Customer Kaydı Yapılıyor...\n");

  // Contract adresleri
  const YEMEK = "0x2bdCC0de6bE1f7D2ee689a0342D76F52E8EFABa3";
  
  console.log(`📋 Kontrat adresleri:`);
  console.log(`   YemekSepeti: ${YEMEK}\n`);

  // BELİRTİLEN MÜŞTERİ ADRESİ
  const CUSTOMER_ADDRESS = "0x12D7c52D054959698c9c8496732BBe6c22706C39";
  
  // Signer'ları al
  const [owner, restaurantOwner, customer] = await ethers.getSigners();
  
  console.log(`👤 Kullanıcı adresleri:`);
  console.log(`   Owner: ${owner.address}`);
  console.log(`   Restaurant Owner: ${restaurantOwner.address} (Tüm restoranları yönetecek)`);
  console.log(`   Customer: ${customer.address} (${CUSTOMER_ADDRESS} - SİZ)\n`);

  // YemekSepeti kontratını bağla
  const YemekSepeti = await ethers.getContractFactory("YemekSepeti");
  const yem = YemekSepeti.attach(YEMEK);

  console.log("🔐 Customer kaydı yapılıyor...\n");

  try {
    // SİZİ customer olarak kaydet (belirtilen adres)
    console.log(`📝 Customer kaydediliyor: ${CUSTOMER_ADDRESS}`);
    
    // Owner signer'ı ile customer kaydı yap (çünkü owner adresi CUSTOMER_ADDRESS ile aynı)
    const customerTx = await yem.connect(owner).registerCustomer("İstanbul, Kadıköy");
    await customerTx.wait();
    console.log(`   ✅ Customer kaydedildi!`);

    console.log("\n🔍 Sistem kontrol ediliyor...\n");

    // Customer kaydını kontrol et
    const customerData = await yem.customers(CUSTOMER_ADDRESS);
    console.log(`👤 Customer (${CUSTOMER_ADDRESS}):`);
    console.log(`   📍 Adres: ${customerData.realWorldAddress}`);
    console.log(`   🆔 Kayıtlı: ${customerData.walletAddress !== ethers.constants.AddressZero ? "✅ Evet" : "❌ Hayır"}`);

    console.log("\n🎉 Customer kaydı tamamlandı!");
    console.log("\n💡 Frontend'de kullanım:");
    console.log(`   🍽️  Müşteri olarak: ${CUSTOMER_ADDRESS} (SİZ)`);
    console.log(`   🏪 Restoran sahibi olarak: ${restaurantOwner.address} (Sistem)`);
    console.log(`\n📱 Frontend: http://localhost:5174/`);
    console.log(`\n🔑 MetaMask'ta ${CUSTOMER_ADDRESS} adresini seçin!`);

  } catch (error) {
    console.error("❌ Hata:", error.message);
    
    if (error.message.includes("already registered")) {
      console.log("\n💡 Bu cüzdan zaten customer olarak kayıtlı!");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
