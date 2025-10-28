// scripts/setup-token-payment.js
const { ethers } = require("hardhat");

async function main() {
  // Signer'ları al
  const [deployer, restaurant, customer] = await ethers.getSigners();

  // Deploy çıktısından adresler - DOĞRU ADRESLER
  const YEMEK = "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1";
  const ORACLE = "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f";
  const FOOD = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319";
  const ESCROW = "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44";

  // Kontrat objelerini bağla
  const yem = await ethers.getContractAt("YemekSepeti", YEMEK);
  const oracle = await ethers.getContractAt("DummyOracle", ORACLE);
  const food = await ethers.getContractAt("FOOD", FOOD);

  console.log("🚀 Token ödeme sistemi kurulumu başlıyor...");

  // 1. Oracle'da ETH fiyatını ayarla (örn: $3000)
  const ethPrice = ethers.utils.parseEther("3000"); // $3000 per ETH
  await oracle.setEthPrice(ethPrice);
  console.log("✅ ETH fiyatı Oracle'da ayarlandı: $3000");

  // 2. Oracle'da FOOD token fiyatını ayarla (örn: $1)
  const foodPrice = ethers.utils.parseEther("1"); // $1 per FOOD token
  await oracle.setTokenPrice(FOOD, foodPrice);
  console.log("✅ FOOD token fiyatı Oracle'da ayarlandı: $1");

  // 3. FOOD token decimals'ını ayarla (18 decimal)
  await oracle.setTokenDecimals(FOOD, 18);
  console.log("✅ FOOD token decimals ayarlandı: 18");

  // 4. Restoran kaydı yap (eğer yoksa)
  try {
    await yem.connect(restaurant).registerRestaurant("Test Restaurant Address");
    console.log("✅ Restoran kaydedildi");
  } catch (e) {
    console.log("ℹ️  Restoran zaten kayıtlı");
  }

  // 5. Menü fiyatlarını ayarla
  await yem.connect(restaurant).setMenuPriceQuote("Adana Kebab", ethers.utils.parseEther("8.90"), 18);
  console.log("✅ Adana Kebab fiyatı ayarlandı: $8.90");

  await yem.connect(restaurant).setMenuPriceQuote("Lahmacun", ethers.utils.parseEther("5.50"), 18);
  console.log("✅ Lahmacun fiyatı ayarlandı: $5.50");

  await yem.connect(restaurant).setMenuPriceQuote("Ayran", ethers.utils.parseEther("2.00"), 18);
  console.log("✅ Ayran fiyatı ayarlandı: $2.00");

  // 6. Token kabul ayarlarını yap
  await yem.connect(restaurant).setAcceptedToken("Adana Kebab", FOOD, true);
  await yem.connect(restaurant).setAcceptedToken("Lahmacun", FOOD, true);
  await yem.connect(restaurant).setAcceptedToken("Ayran", FOOD, true);
  console.log("✅ Tüm ürünler için FOOD token kabul edildi");

  // ETH ödemelerini de aktif et
  await yem.connect(restaurant).setAcceptedToken("Adana Kebab", ethers.constants.AddressZero, true);
  await yem.connect(restaurant).setAcceptedToken("Lahmacun", ethers.constants.AddressZero, true);
  await yem.connect(restaurant).setAcceptedToken("Ayran", ethers.constants.AddressZero, true);
  console.log("✅ Tüm ürünler için ETH ödemesi de aktif edildi");

  // 7. Müşteri kaydı yap (eğer yoksa)
  try {
    await yem.connect(customer).registerCustomer("Customer Address");
    console.log("✅ Müşteri kaydedildi");
  } catch (e) {
    console.log("ℹ️  Müşteri zaten kayıtlı");
  }

  // 8. Müşteriye FOOD token ver (test için)
  const foodAmount = ethers.utils.parseEther("1000"); // 1000 FOOD token
  await food.transfer(customer.address, foodAmount);
  console.log("✅ Müşteriye 1000 FOOD token gönderildi");

  // 9. Müşteri FOOD token'ı approve etsin
  const approveAmount = ethers.utils.parseEther("10000"); // 10000 FOOD token
  await food.connect(customer).approve(YEMEK, approveAmount);
  console.log("✅ FOOD token approve edildi");

  console.log("\n🎉 Token ödeme sistemi kurulumu tamamlandı!");
  
  // Test için fiyatları kontrol et
  console.log("\n📊 Fiyat Kontrolleri:");
  const ethPriceCheck = await oracle.currentEthPriceE18();
  const foodPriceCheck = await oracle.currentTokenPriceE18(FOOD);
  console.log(`ETH Fiyatı: $${ethers.utils.formatEther(ethPriceCheck)}`);
  console.log(`FOOD Fiyatı: $${ethers.utils.formatEther(foodPriceCheck)}`);

  // Örnek fiyat teklifi al
  try {
    const [requiredFood] = await yem.getRequiredPaymentMany(
      restaurant.address,
      ["Adana Kebab"],
      [1],
      FOOD
    );
    console.log(`1 Adana Kebab için gereken FOOD: ${ethers.utils.formatEther(requiredFood)}`);

    const [requiredETH] = await yem.getRequiredPaymentMany(
      restaurant.address,
      ["Adana Kebab"],
      [1],
      ethers.constants.AddressZero
    );
    console.log(`1 Adana Kebab için gereken ETH: ${ethers.utils.formatEther(requiredETH)}`);
  } catch (error) {
    console.log("⚠️  Fiyat hesaplama hatası (normal, ürünler henüz eklenmemiş olabilir)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Hata:", error);
    process.exit(1);
  });
