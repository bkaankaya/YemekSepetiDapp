const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔄 Owner Yetkisi Transfer Ediliyor...\n");

  // Deploy output'dan kontrat adreslerini oku
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
  
  console.log(`📋 Kontrat adresleri:`);
  console.log(`   YemekSepeti: ${YEMEKSEPETI_ADDRESS}\n`);

  // Yeni adresler
  const RESTAURANT_ADDR = "0x01b56546769f424F18d5931303c7E1a4fCE1422B";

  // Signer'ları al
  const [owner, restaurantOwner] = await ethers.getSigners();
  
  console.log(`👤 Kullanıcı adresleri:`);
  console.log(`   Signer 0 (Owner): ${owner.address}`);
  console.log(`   Signer 1 (Restaurant): ${restaurantOwner.address} (${RESTAURANT_ADDR})\n`);

  // YemekSepeti kontratını bağla
  const YemekSepeti = await ethers.getContractFactory("YemekSepeti");
  const yem = YemekSepeti.attach(YEMEKSEPETI_ADDRESS);

  try {
    // Mevcut owner'ı kontrol et
    const currentOwner = await yem.owner();
    console.log(`🔍 Mevcut Contract Owner: ${currentOwner}`);
    
    // Eğer owner zaten restaurant ise, transfer gerekmiyor
    if (currentOwner.toLowerCase() === restaurantOwner.address.toLowerCase()) {
      console.log(`✅ Owner zaten restaurant adresinde! Transfer gerekmiyor.`);
      console.log(`🎉 Sistem hazır!`);
      return;
    }
    
    // Eğer owner eski adresteyse ve restaurant ile transfer gerekiyorsa
    if (currentOwner.toLowerCase() === owner.address.toLowerCase()) {
      console.log(`\n🔄 Ownership transfer ediliyor...`);
      console.log(`   From: ${owner.address}`);
      console.log(`   To: ${restaurantOwner.address}`);
      
      const tx = await yem.transferOwnership(restaurantOwner.address);
      console.log(`   Transaction hash: ${tx.hash}`);
      
      console.log(`⏳ Transaction bekleniyor...`);
      await tx.wait();
      
      // Yeni owner'ı kontrol et
      const newOwner = await yem.owner();
      console.log(`✅ Yeni Owner: ${newOwner}`);
      
      if (newOwner.toLowerCase() === restaurantOwner.address.toLowerCase()) {
        console.log(`\n🎉 Ownership başarıyla transfer edildi!`);
        console.log(`📋 Restaurant artık owner yetkisine sahip!`);
      } else {
        console.log(`❌ Ownership transfer başarısız!`);
      }
    } else {
      console.log(`❌ Owner adresi beklenmedik! Mevcut: ${currentOwner}`);
      console.log(`❌ Bu durumu manuel kontrol edin.`);
    }
    
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
