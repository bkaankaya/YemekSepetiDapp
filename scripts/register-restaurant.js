const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Restoran kayıt işlemi başlatılıyor...");
  
  // Kontrat adreslerini al
  const YEMEKSEPETI_ADDRESS = "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1"; // Deploy edilen kontrat adresi
  
  // Kontratı al
  const YemekSepeti = await ethers.getContractFactory("YemekSepeti");
  const yemekSepeti = YemekSepeti.attach(YEMEKSEPETI_ADDRESS);
  
  // BELİRTİLEN RESTORAN ADRESİ
  const RESTAURANT_ADDRESS = "0x01b56546769f424F18d5931303c7E1a4fCE1422B";
  
  // Bu adrese sahip signer'ı bul
  const signers = await ethers.getSigners();
  let signer = null;
  let signerAddress = null;
  
  for (const s of signers) {
    const addr = await s.getAddress();
    if (addr.toLowerCase() === RESTAURANT_ADDRESS.toLowerCase()) {
      signer = s;
      signerAddress = addr;
      break;
    }
  }
  
  if (!signer) {
    console.error("❌ Hedef cüzdan bulunamadı:", RESTAURANT_ADDRESS);
    console.log("📋 Mevcut cüzdanlar:");
    for (let i = 0; i < signers.length; i++) {
      const addr = await signers[i].getAddress();
      console.log(`   ${i}: ${addr}`);
    }
    return;
  }
  
  console.log(`📝 Cüzdan adresi: ${signerAddress}`);
  
  try {
    // Restoran olarak kayıt ol
    const realWorldAddress = "İstanbul, Merkez"; // Gerçek adresinizi buraya yazın
    
    console.log("📋 Restoran kaydı yapılıyor...");
    const tx = await yemekSepeti.connect(signer).registerRestaurant(realWorldAddress);
    
    console.log("⏳ Transaction bekleniyor...");
    await tx.wait();
    
    console.log("✅ Restoran başarıyla kayıt edildi!");
    console.log(`🏪 Restoran adresi: ${signerAddress}`);
    console.log(`📍 Gerçek dünya adresi: ${realWorldAddress}`);
    
    // Kayıt kontrolü
    const restaurant = await yemekSepeti.restaurants(signerAddress);
    console.log("🔍 Kayıt kontrolü:");
    console.log(`   - Wallet adresi: ${restaurant.walletAddress}`);
    console.log(`   - Gerçek adres: ${restaurant.realWorldAddress}`);
    
  } catch (error) {
    console.error("❌ Hata oluştu:", error.message);
    
    if (error.message.includes("already registered")) {
      console.log("ℹ️  Bu cüzdan zaten restoran olarak kayıtlı.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
