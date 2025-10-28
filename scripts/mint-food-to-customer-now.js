const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🍕 Customer'a FOOD Token Yükleniyor...\n");
  
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const FOOD_ADDRESS = deployOutput.FOOD;
  
  console.log("📋 Kontrat adresi:");
  console.log(`   FOOD Token: ${FOOD_ADDRESS}\n`);
  
  // BELİRTİLEN ADRESLER
  const CUSTOMER_ADDRESS = "0x12D7c52D054959698c9c8496732BBe6c22706C39";
  
  console.log("👤 Customer Adresi:");
  console.log(`   ${CUSTOMER_ADDRESS}\n`);
  
  const signers = await ethers.getSigners();
  
  // Owner signer'ı bul (FOOD token'ı mint edecek)
  let ownerSigner = null;
  for (const signer of signers) {
    if (signer.address.toLowerCase() === CUSTOMER_ADDRESS.toLowerCase()) {
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
    
    console.log("\n📤 Customer'a FOOD token yükleniyor...");
    
    // Customer'a 1000 FOOD mint et
    const mintAmount = ethers.utils.parseEther("1000");
    console.log(`   Miktar: 1000 FOOD`);
    
    if (ownerRole.toLowerCase() === ownerSigner.address.toLowerCase()) {
      const mintTx = await foodToken.connect(ownerSigner).mint(CUSTOMER_ADDRESS, mintAmount);
      await mintTx.wait();
      console.log("   ✅ 1000 FOOD mint edildi!");
    } else {
      console.log("   ❌ Owner mint yetkisi yok!");
      return;
    }
    
    console.log("\n🔍 Mint sonrası bakiyeler...");
    const newCustomerBalance = await foodToken.balanceOf(CUSTOMER_ADDRESS);
    console.log(`   Customer yeni bakiye: ${ethers.utils.formatEther(newCustomerBalance)} FOOD`);
    
    const newTotalSupply = await foodToken.totalSupply();
    console.log(`   Yeni Total Supply: ${ethers.utils.formatEther(newTotalSupply)} FOOD`);
    
  } catch (error) {
    console.error("❌ Hata:", error.message);
  }
  
  console.log("\n🎯 FOOD token yükleme tamamlandı!");
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
