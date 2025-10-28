const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🍕 Customer FOOD Token Bakiyesi Kontrol Ediliyor...\n");
  
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
  const FOOD_ADDRESS = deployOutput.FOOD;
  
  console.log("📋 Kontrat adresleri:");
  console.log(`   YemekSepeti: ${YEMEKSEPETI_ADDRESS}`);
  console.log(`   FOOD Token: ${FOOD_ADDRESS}\n`);
  
  // BELİRTİLEN ADRESLER
  const CUSTOMER_ADDRESS = "0x12D7c52D054959698c9c8496732BBe6c22706C39";
  const OWNER_ADDRESS = "0x01b56546769f424F18d5931303c7E1a4fCE1422B"; // Owner da customer
  
  console.log("👤 Adresler:");
  console.log(`   Customer: ${CUSTOMER_ADDRESS}`);
  console.log(`   Owner: ${OWNER_ADDRESS}\n`);
  
  const signers = await ethers.getSigners();
  
  // Owner signer'ı bul (FOOD token'ı mint edecek)
  let ownerSigner = null;
  for (const signer of signers) {
    if (signer.address.toLowerCase() === OWNER_ADDRESS.toLowerCase()) {
      ownerSigner = signer;
      break;
    }
  }
  
  if (!ownerSigner) {
    console.log("❌ Owner signer bulunamadı!");
    return;
  }
  
  console.log(`✅ Owner signer bulundu: ${ownerSigner.address}`);
  
  // FOOD token kontratını al
  const FOOD = await ethers.getContractFactory("FOOD");
  const foodToken = FOOD.attach(FOOD_ADDRESS);
  
  try {
    console.log("\n🔍 Mevcut FOOD token bakiyeleri...");
    
    // Owner bakiyesi
    const ownerBalance = await foodToken.balanceOf(ownerSigner.address);
    console.log(`   Owner (${ownerSigner.address}): ${ethers.utils.formatEther(ownerBalance)} FOOD`);
    
    // Customer bakiyesi
    const customerBalance = await foodToken.balanceOf(CUSTOMER_ADDRESS);
    console.log(`   Customer (${CUSTOMER_ADDRESS}): ${ethers.utils.formatEther(customerBalance)} FOOD`);
    
    // Total supply
    const totalSupply = await foodToken.totalSupply();
    console.log(`   Total Supply: ${ethers.utils.formatEther(totalSupply)} FOOD`);
    
    // Owner'ın mint yetkisi var mı?
    const ownerRole = await foodToken.owner();
    console.log(`   Token Owner: ${ownerRole}`);
    console.log(`   Owner mint yetkisi: ${ownerRole.toLowerCase() === ownerSigner.address.toLowerCase() ? '✅ Evet' : '❌ Hayır'}`);
    
    if (customerBalance.isZero()) {
      console.log("\n📤 Customer'a FOOD token gönderiliyor...");
      
      // Eğer owner'da yeterli bakiye varsa transfer et
      if (ownerBalance.gte(ethers.utils.parseEther("500"))) {
        console.log("   💡 Owner'dan transfer yapılıyor...");
        const tx = await foodToken.connect(ownerSigner).transfer(CUSTOMER_ADDRESS, ethers.utils.parseEther("500"));
        await tx.wait();
        console.log("   ✅ 500 FOOD transfer edildi!");
      } else {
        console.log("   💡 Owner'da yeterli bakiye yok, mint yapılıyor...");
        
        // Mint yetkisi kontrol et
        if (ownerRole.toLowerCase() === ownerSigner.address.toLowerCase()) {
          const mintTx = await foodToken.connect(ownerSigner).mint(CUSTOMER_ADDRESS, ethers.utils.parseEther("500"));
          await mintTx.wait();
          console.log("   ✅ 500 FOOD mint edildi!");
        } else {
          console.log("   ❌ Owner mint yetkisi yok!");
          return;
        }
      }
      
      console.log("\n🔍 Transfer sonrası bakiyeler...");
      const newCustomerBalance = await foodToken.balanceOf(CUSTOMER_ADDRESS);
      console.log(`   Customer yeni bakiye: ${ethers.utils.formatEther(newCustomerBalance)} FOOD`);
      
    } else {
      console.log("\nℹ️ Customer'da zaten FOOD token var!");
    }
    
  } catch (error) {
    console.error("❌ Hata:", error.message);
  }
  
  console.log("\n🎯 FOOD token bakiye kontrolü tamamlandı!");
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
