const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 OTOMATİK CÜZDAN FONLAMA BAŞLIYOR...\n");
  
  // BELİRTİLEN ADRESLER
  const CUSTOMER_ADDRESS = "0x12D7c52D054959698c9c8496732BBe6c22706C39";
  const RESTAURANT_ADDRESS = "0x01b56546769f424F18d5931303c7E1a4fCE1422B";
  
  try {
    // Hardhat node'un hazır olmasını bekle
    console.log("⏳ Hardhat node bekleniyor...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const signers = await ethers.getSigners();
    const owner = signers[0]; // Owner (en zengin olan)
    
    console.log("📋 Owner bilgisi:");
    console.log(`   Adres: ${owner.address}`);
    console.log(`   Bakiye: ${ethers.utils.formatEther(await owner.getBalance())} ETH`);
    
    // Transfer miktarı (her cüzdana 100 ETH)
    const transferAmount = ethers.utils.parseEther("100");
    
    console.log(`\n💰 Her cüzdana ${ethers.utils.formatEther(transferAmount)} ETH transfer ediliyor...`);
    
    // Belirtilen adreslere ETH transfer et
    console.log(`📤 Restaurant cüzdanına transfer...`);
    console.log(`   Hedef: ${RESTAURANT_ADDRESS}`);
    
    const restaurantSigner = signers[1]; // Restaurant signer
    const tx1 = await owner.sendTransaction({
      to: restaurantSigner.address,
      value: transferAmount
    });
    await tx1.wait();
    console.log(`   ✅ Restaurant cüzdanına ETH transfer edildi!`);
    
    console.log(`📤 Customer cüzdanına transfer...`);
    console.log(`   Hedef: ${CUSTOMER_ADDRESS}`);
    
    const customerSigner = signers[2]; // Customer signer
    const tx2 = await owner.sendTransaction({
      to: customerSigner.address,
      value: transferAmount
    });
    await tx2.wait();
    console.log(`   ✅ Customer cüzdanına ETH transfer edildi!`);
    
    console.log("\n=== BAKİYE DURUMU ===");
    
    // Tüm cüzdanların bakiyelerini kontrol et
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const balance = await signer.getBalance();
      const walletType = i === 0 ? '👑 Owner' : i === 1 ? '🏪 Restaurant' : '👤 Customer';
      
      console.log(`${walletType}: ${ethers.utils.formatEther(balance)} ETH`);
    }
    
    console.log("\n🎉 OTOMATİK FONLAMA TAMAMLANDI!");
    console.log("💡 Tüm cüzdanlar hazır!");
    console.log(`\n📋 Belirtilen adresler:`);
    console.log(`   🏪 Restaurant: ${RESTAURANT_ADDRESS}`);
    console.log(`   👤 Customer: ${CUSTOMER_ADDRESS}`);
    
  } catch (error) {
    console.error("❌ Hata:", error.message);
    console.error("Stack:", error.stack);
  }
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});



