// scripts/test-restaurant.js
// Restoran'ın smart contract'ta kayıtlı olup olmadığını test et
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Restoran kaydını test ediyorum...");

  // Contract adreslerini al
  const deployOutput = require("../deploy-output.json");
  const YemekSepetiAddress = deployOutput.YemekSepeti;

  console.log("📋 YemekSepeti Contract Adresi:", YemekSepetiAddress);

  // Contract instance'ı oluştur
  const YemekSepeti = await ethers.getContractFactory("YemekSepeti");
  const yemekSepeti = YemekSepeti.attach(YemekSepetiAddress);

  // Test edilecek restoran adresi
  const restaurantAddress = "0x01b56546769f424F18d5931303c7E1a4fCE1422B";
  console.log("🍕 Test edilen restoran adresi:", restaurantAddress);

  try {
    // Restoran verisini oku
    console.log("🔍 Restoran verisi okunuyor...");
    const restaurantData = await yemekSepeti.restaurants(restaurantAddress);
    
    console.log("📋 Restoran verisi:", restaurantData);
    console.log("📋 walletAddress:", restaurantData.walletAddress);
    console.log("📋 realWorldAddress:", restaurantData.realWorldAddress);
    
    // AddressZero ile karşılaştır
    const AddressZero = "0x0000000000000000000000000000000000000000";
    const isRegistered = restaurantData.walletAddress !== AddressZero;
    
    console.log("✅ Restoran kayıtlı mı?", isRegistered);
    
    if (isRegistered) {
      console.log("🎉 Restoran başarıyla kayıtlı!");
    } else {
      console.log("❌ Restoran kayıtlı değil!");
      console.log("🔧 Restoran'ı kaydetmek için register-users.js çalıştırın.");
    }
    
  } catch (error) {
    console.error("❌ Hata:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Hata:", error);
    process.exit(1);
  });
