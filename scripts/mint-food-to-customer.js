// scripts/mint-food-to-customer.js
const fs = require("fs");
const { ethers } = require("hardhat");

// Deploy çıktılarından güncel adresler
const ADDRS = JSON.parse(fs.readFileSync("./deploy-output.json", "utf8"));

async function main() {
  console.log("💰 Customer'a FOOD Token Gönderiliyor...\n");
  
  // BELİRTİLEN MÜŞTERİ ADRESİ
  const CUSTOMER_ADDRESS = "0x12D7c52D054959698c9c8496732BBe6c22706C39";
  
  console.log("📋 Kontrat adresleri:");
  console.log(`   FOOD Token: ${ADDRS.FOOD}`);
  console.log(`   Customer: ${CUSTOMER_ADDRESS}\n`);
  
  const signers = await ethers.getSigners();
  const owner = signers[0];
  
  // Customer signer'ı bul
  let customerSigner = null;
  for (const signer of signers) {
    if (signer.address.toLowerCase() === CUSTOMER_ADDRESS.toLowerCase()) {
      customerSigner = signer;
      break;
    }
  }
  
  if (!customerSigner) {
    console.log("❌ Customer signer bulunamadı!");
    return;
  }
  
  console.log(`✅ Owner signer bulundu: ${owner.address}`);
  console.log(`✅ Customer signer bulundu: ${customerSigner.address}`);
  
  const foodToken = await ethers.getContractAt("FOOD", ADDRS.FOOD, owner);
  
  const currentBalance = await foodToken.balanceOf(customerSigner.address);
  console.log(`📊 Customer'ın mevcut FOOD bakiyesi: ${ethers.utils.formatEther(currentBalance)}`);
  
  const amountToSend = ethers.utils.parseEther("500"); // 500 FOOD
  console.log(`📤 Customer'a ${ethers.utils.formatEther(amountToSend)} FOOD gönderiliyor...`);
  
  const tx = await foodToken.transfer(customerSigner.address, amountToSend);
  await tx.wait();
  
  console.log("✅ Transfer tamamlandı!");
  
  const newBalance = await foodToken.balanceOf(customerSigner.address);
  console.log(`📊 Customer'ın yeni FOOD bakiyesi: ${ethers.utils.formatEther(newBalance)}`);
  
  console.log("\n🎉 FOOD Token transferi başarılı!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
