const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔄 Yeni Signer'lar ile Kayıt Yapılıyor...\n");
  
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
  
  const signers = await ethers.getSigners();
  
  console.log("📋 Kontrat adresi:");
  console.log(`   YemekSepeti: ${YEMEKSEPETI_ADDRESS}`);
  
  const YemekSepeti = await ethers.getContractFactory("YemekSepeti");
  const yem = YemekSepeti.attach(YEMEKSEPETI_ADDRESS);
  
  // Yeni cüzdan adresleri
  const NEW_CUSTOMER_ADDRESS = "0x12D7c52D054959698c9c8496732BBe6c22706C39";
  const NEW_RESTAURANT_ADDRESS = "0x01b56546769f424F18d5931303c7E1a4fCE1422B";
  
  console.log("\n🆕 Kaydedilecek yeni cüzdan adresleri:");
  console.log(`   Customer: ${NEW_CUSTOMER_ADDRESS}`);
  console.log(`   Restaurant: ${NEW_RESTAURANT_ADDRESS}`);
  
  try {
    // Customer signer'ını bul
    const customerSigner = signers.find(signer => 
      signer.address.toLowerCase() === NEW_CUSTOMER_ADDRESS.toLowerCase()
    );
    
    // Restaurant signer'ını bul
    const restaurantSigner = signers.find(signer => 
      signer.address.toLowerCase() === NEW_RESTAURANT_ADDRESS.toLowerCase()
    );
    
    if (!customerSigner) {
      throw new Error("Customer signer bulunamadı!");
    }
    
    if (!restaurantSigner) {
      throw new Error("Restaurant signer bulunamadı!");
    }
    
    console.log("\n✅ Signer'lar bulundu:");
    console.log(`   Customer Signer: ${customerSigner.address} (Index: ${signers.indexOf(customerSigner)})`);
    console.log(`   Restaurant Signer: ${restaurantSigner.address} (Index: ${signers.indexOf(restaurantSigner)})`);
    
    console.log("\n=== MEVCUT DURUM KONTROL ===");
    
    // Mevcut customer kaydını kontrol et
    const currentCustomerData = await yem.customers(NEW_CUSTOMER_ADDRESS);
    const isCurrentCustomer = currentCustomerData.walletAddress !== ethers.constants.AddressZero;
    console.log(`👤 ${NEW_CUSTOMER_ADDRESS} mevcut customer kaydı: ${isCurrentCustomer ? "✅ Var" : "❌ Yok"}`);
    
    // Mevcut restaurant kaydını kontrol et
    const currentRestaurantData = await yem.restaurants(NEW_RESTAURANT_ADDRESS);
    const isCurrentRestaurant = currentRestaurantData.walletAddress !== ethers.constants.AddressZero;
    console.log(`🏪 ${NEW_RESTAURANT_ADDRESS} mevcut restaurant kaydı: ${isCurrentRestaurant ? "✅ Var" : "❌ Yok"}`);
    
    console.log("\n=== YENİ KAYITLAR YAPILIYOR ===");
    
    // Customer kaydı yap
    if (!isCurrentCustomer) {
      console.log(`📝 Customer kaydı yapılıyor: ${NEW_CUSTOMER_ADDRESS}`);
      const customerTx = await yem.connect(customerSigner).registerCustomer("Web Client Address");
      await customerTx.wait();
      console.log(`   ✅ Customer kaydedildi!`);
    } else {
      console.log(`   ✅ Customer zaten kayıtlı`);
    }
    
    // Restaurant kaydı yap
    if (!isCurrentRestaurant) {
      console.log(`📝 Restaurant kaydı yapılıyor: ${NEW_RESTAURANT_ADDRESS}`);
      const restaurantTx = await yem.connect(restaurantSigner).registerRestaurant("Ortak Restoran Cüzdanı");
      await restaurantTx.wait();
      console.log(`   ✅ Restaurant kaydedildi!`);
    } else {
      console.log(`   ✅ Restaurant zaten kayıtlı`);
    }
    
    console.log("\n=== KONTROL EDİLİYOR ===");
    
    // Son durumu kontrol et
    const finalCustomerData = await yem.customers(NEW_CUSTOMER_ADDRESS);
    const finalRestaurantData = await yem.restaurants(NEW_RESTAURANT_ADDRESS);
    
    console.log(`👤 ${NEW_CUSTOMER_ADDRESS} customer kaydı: ${finalCustomerData.walletAddress !== ethers.constants.AddressZero ? "✅ Başarılı" : "❌ Başarısız"}`);
    if (finalCustomerData.walletAddress !== ethers.constants.AddressZero) {
      console.log(`   📍 Adres: ${finalCustomerData.realWorldAddress}`);
    }
    
    console.log(`🏪 ${NEW_RESTAURANT_ADDRESS} restaurant kaydı: ${finalRestaurantData.walletAddress !== ethers.constants.AddressZero ? "✅ Başarılı" : "❌ Başarısız"}`);
    if (finalRestaurantData.walletAddress !== ethers.constants.AddressZero) {
      console.log(`   📍 Adres: ${finalRestaurantData.realWorldAddress}`);
    }
    
    console.log("\n🎉 Cüzdan adresleri güncellendi!");
    console.log("\n💡 Frontend'de kullanım:");
    console.log(`   🍽️  Müşteri olarak: ${NEW_CUSTOMER_ADDRESS}`);
    console.log(`   🏪 Restoran sahibi olarak: ${NEW_RESTAURANT_ADDRESS} (Restoran paneline girebilir)`);
    console.log(`\n📱 Frontend: http://localhost:5173/`);
    console.log(`\n🔑 Restoran paneline girmek için MetaMask'ta ${NEW_RESTAURANT_ADDRESS} adresini seçin!`);
    
  } catch (error) {
    console.error("❌ Hata:", error.message);
  }
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
