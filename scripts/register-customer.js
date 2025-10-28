const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔐 Müşteri kayıt scripti başlatılıyor...\n");

  // Deploy output'dan kontrat adreslerini oku
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
  
  console.log(`📋 Kontrat adresleri:`);
  console.log(`   YemekSepeti: ${YEMEKSEPETI_ADDRESS}\n`);

  // BELİRTİLEN MÜŞTERİ ADRESİ
  const CUSTOMER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  
  // Signer'ları al
  const [owner, restaurantOwner, customer] = await ethers.getSigners();
  
  console.log(`👤 Kullanıcı adresleri:`);
  console.log(`   Owner: ${owner.address}`);
  console.log(`   Restaurant Owner: ${restaurantOwner.address}`);
  console.log(`   Customer: ${customer.address} (${CUSTOMER_ADDRESS})\n`);

  // YemekSepeti kontratını bağla
  const YemekSepeti = await ethers.getContractFactory("YemekSepeti");
  const yem = YemekSepeti.attach(YEMEKSEPETI_ADDRESS);

  console.log("🏪 Müşteri kayıtları yapılıyor...\n");

  try {
    // Belirtilen müşteri adresini kaydet
    console.log(`📝 Customer kaydediliyor: ${CUSTOMER_ADDRESS}`);
    const tx = await yem.connect(owner).registerCustomer("İstanbul, Kadıköy");
    await tx.wait();
    console.log(`   ✅ Customer kaydedildi!`);

    console.log("\n🔍 Müşteri kayıtları kontrol ediliyor...\n");

    // Kayıtları kontrol et
    const customerData = await yem.customers(CUSTOMER_ADDRESS);

    console.log(`👤 Customer (${CUSTOMER_ADDRESS}):`);
    console.log(`   📍 Adres: ${customerData.realWorldAddress}`);
    console.log(`   🆔 Kayıtlı: ${customerData.walletAddress !== ethers.constants.AddressZero ? "✅ Evet" : "❌ Hayır"}`);

    console.log("\n🎉 Müşteri kaydı tamamlandı!");
    console.log("\n💡 Frontend'de bu adresi kullanarak giriş yapabilirsiniz:");
    console.log(`   Customer: ${CUSTOMER_ADDRESS}`);

  } catch (error) {
    console.error("❌ Hata:", error.message);
    
    if (error.message.includes("already registered")) {
      console.log("\n💡 Bu müşteri zaten kayıtlı. Farklı bir adres deneyin.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
