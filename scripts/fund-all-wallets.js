const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("💰 Tüm Cüzdanlara ETH + Token Fonlaması Yapılıyor...\n");
  
  // Deploy output'dan kontrat adreslerini oku
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const FOOD_TOKEN_ADDRESS = deployOutput.FOOD;
  
  const signers = await ethers.getSigners();
  const owner = signers[0]; // Owner (ilk signer - en zengin olan)
  
  console.log("📋 Owner bilgisi:");
  console.log(`   Adres: ${owner.address}`);
  console.log(`   Bakiye: ${ethers.utils.formatEther(await owner.getBalance())} ETH`);
  
  // Hardhat config'deki tüm cüzdan adresleri
  const allWallets = [
    owner.address, // Owner (Index 0) - Bu değişmez
    "0x01b56546769f424F18d5931303c7E1a4fCE1422B", // Restaurant (Index 1)
    "0x12D7c52D054959698c9c8496732BBe6c22706C39"  // Customer (Index 2)
  ];
  
  console.log("\n🆕 Fonlanacak cüzdan adresleri:");
  allWallets.forEach((address, index) => {
    console.log(`   ${index === 0 ? '👑 Owner' : index === 1 ? '🏪 Restaurant' : '👤 Customer'}: ${address}`);
  });
  
  console.log(`\n📋 Token adresi:`);
  console.log(`   FOOD Token: ${FOOD_TOKEN_ADDRESS}\n`);

  try {
    // ===== ETH TRANSFER =====
    const transferAmount = ethers.utils.parseEther("50");
    
    console.log(`=== ETH TRANSFER (Her cüzdana ${ethers.utils.formatEther(transferAmount)} ETH) ===`);
    
    // Her cüzdana ETH transfer et (Owner hariç)
    for (let i = 1; i < signers.length; i++) {
      const targetSigner = signers[i];
      const walletType = i === 1 ? 'Restaurant' : 'Customer';
      
      console.log(`📤 ${walletType} cüzdanına ${ethers.utils.formatEther(transferAmount)} ETH transfer ediliyor...`);
      console.log(`   Hedef: ${targetSigner.address}`);
      
      const tx = await owner.sendTransaction({
        to: targetSigner.address,
        value: transferAmount
      });
      await tx.wait();
      console.log(`   ✅ ${walletType} cüzdanına ETH transfer edildi!`);
    }
    
    console.log("\n=== ETH BAKİYE KONTROL ===");
    
    // Tüm cüzdanların ETH bakiyelerini kontrol et
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const balance = await signer.getBalance();
      const walletType = i === 0 ? '👑 Owner' : i === 1 ? '🏪 Restaurant' : '👤 Customer';
      
      console.log(`${walletType}: ${ethers.utils.formatEther(balance)} ETH`);
    }

    // ===== FOOD TOKEN TRANSFER =====
    console.log(`\n=== FOOD TOKEN TRANSFER ===`);
    
    // FOOD Token kontratını bağla
    const FOOD = await ethers.getContractFactory("FOOD");
    const foodToken = FOOD.attach(FOOD_TOKEN_ADDRESS);

    // Owner'ın FOOD token bakiyesini kontrol et
    const ownerBalance = await foodToken.balanceOf(owner.address);
    console.log(`💰 Owner FOOD Token Bakiyesi: ${ethers.utils.formatEther(ownerBalance)} FOOD`);
    
    if (ownerBalance.eq(0)) {
      console.log("❌ Owner'da FOOD token yok! Token mint ediliyor...");
      
      // FOOD token mint et (owner'a)
      const mintAmount = ethers.utils.parseEther("10000"); // 10,000 FOOD
      const mintTx = await foodToken.mint(owner.address, mintAmount);
      await mintTx.wait();
      console.log(`✅ Owner'a ${ethers.utils.formatEther(mintAmount)} FOOD mint edildi!`);
    }

    // Transfer miktarları
    const customerTransferAmount = ethers.utils.parseEther("1000"); // 1,000 FOOD
    const restaurantTransferAmount = ethers.utils.parseEther("5000"); // 5,000 FOOD

    console.log(`\n🔄 FOOD Token Transferleri:`);

    // Customer'a FOOD token transfer et
    console.log(`📤 Customer'a ${ethers.utils.formatEther(customerTransferAmount)} FOOD transfer ediliyor...`);
    const customerTx = await foodToken.transfer(allWallets[2], customerTransferAmount);
    await customerTx.wait();
    console.log(`✅ Customer'a FOOD token transfer edildi!`);

    // Restaurant'a FOOD token transfer et
    console.log(`📤 Restaurant'a ${ethers.utils.formatEther(restaurantTransferAmount)} FOOD transfer ediliyor...`);
    const restaurantTx = await foodToken.transfer(allWallets[1], restaurantTransferAmount);
    await restaurantTx.wait();
    console.log(`✅ Restaurant'a FOOD token transfer edildi!`);

    // ===== FINAL BAKİYE KONTROL =====
    console.log(`\n=== FINAL BAKİYE KONTROL ===`);
    
    // ETH Bakiyeleri
    console.log(`💰 ETH Bakiyeleri:`);
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const balance = await signer.getBalance();
      const walletType = i === 0 ? '👑 Owner' : i === 1 ? '🏪 Restaurant' : '👤 Customer';
      
      console.log(`${walletType}: ${ethers.utils.formatEther(balance)} ETH`);
    }
    
    // FOOD Token Bakiyeleri
    console.log(`\n🪙 FOOD Token Bakiyeleri:`);
    const ownerFinalBalance = await foodToken.balanceOf(owner.address);
    const customerFinalBalance = await foodToken.balanceOf(allWallets[2]);
    const restaurantFinalBalance = await foodToken.balanceOf(allWallets[1]);
    
    console.log(`👑 Owner: ${ethers.utils.formatEther(ownerFinalBalance)} FOOD`);
    console.log(`👤 Customer: ${ethers.utils.formatEther(customerFinalBalance)} FOOD`);
    console.log(`🏪 Restaurant: ${ethers.utils.formatEther(restaurantFinalBalance)} FOOD`);
    
    console.log("\n🎉 Tüm fonlamalar tamamlandı!");
    console.log("💡 Artık tüm cüzdanlarla ETH ve FOOD token ile işlem yapabilirsiniz!");
    console.log("\n📋 Kullanım:");
    console.log("   - Owner (Index 0): Admin işlemleri");
    console.log("   - Restaurant (Index 1): Restoran işlemleri");
    console.log("   - Customer (Index 2): Müşteri işlemleri");
    console.log("\n🚀 Sonraki adım: Token approve işlemi yapın!");
    
  } catch (error) {
    console.error("❌ Hata:", error.message);
    console.error("Stack:", error.stack);
  }
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
