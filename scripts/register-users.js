// scripts/register-users.js
// Yeni deploy edilen contract'lara kullanıcıları kaydet
const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Kullanıcılar yeni contract'lara kaydediliyor...");

  // Contract adreslerini al
  const deployOutput = require("../deploy-output.json");
  const YemekSepetiAddress = deployOutput.YemekSepeti;

  // Contract instance'ı oluştur
  const YemekSepeti = await ethers.getContractFactory("YemekSepeti");
  const yemekSepeti = YemekSepeti.attach(YemekSepetiAddress);

  // Cüzdanları al
  const [owner, restaurant, customer] = await ethers.getSigners();

  console.log("👤 Owner:", owner.address);
  console.log("🍕 Restaurant:", restaurant.address);
  console.log("👨‍💼 Customer:", customer.address);

  // Restoran'ı kaydet
  console.log("📝 Restoran kaydediliyor...");
  const tx1 = await yemekSepeti.connect(restaurant).registerRestaurant("Restoran Adresi");
  await tx1.wait();
  console.log("✅ Restoran kaydedildi!");

  // Müşteriyi kaydet
  console.log("📝 Müşteri kaydediliyor...");
  const tx2 = await yemekSepeti.connect(customer).registerCustomer("Müşteri Adresi");
  await tx2.wait();
  console.log("✅ Müşteri kaydedildi!");

  // Restoran menü fiyatlarını ayarla
  console.log("🍽️ Restoran menü fiyatları ayarlanıyor...");
  
  // Pizza fiyatı: $15 (1500 cent, 2 decimal)
  const tx3 = await yemekSepeti.connect(restaurant).setMenuPriceQuote("Pizza", 1500, 2);
  await tx3.wait();
  
  // Burger fiyatı: $12 (1200 cent, 2 decimal)
  const tx4 = await yemekSepeti.connect(restaurant).setMenuPriceQuote("Burger", 1200, 2);
  await tx4.wait();
  
  // ETH ödemeyi kabul et
  const tx5 = await yemekSepeti.connect(restaurant).setAcceptedToken("Pizza", "0x0000000000000000000000000000000000000000", true);
  await tx5.wait();
  
  const tx6 = await yemekSepeti.connect(restaurant).setAcceptedToken("Burger", "0x0000000000000000000000000000000000000000", true);
  await tx6.wait();

  console.log("✅ Menü fiyatları ve ödeme yöntemleri ayarlandı!");

  console.log("🎉 Tüm kullanıcılar başarıyla kaydedildi!");
  console.log("🍕 Restoran artık panele girebilir!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Hata:", error);
    process.exit(1);
  });
