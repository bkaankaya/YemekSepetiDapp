const { ethers } = require("hardhat");

async function main() {
  console.log("=== FOOD Token Fiyatı Ayarlanıyor ===");
  
  // Deploy output'dan güncel adresleri oku
  const fs = require("fs");
  const deployOutput = JSON.parse(fs.readFileSync("./deploy-output.json", "utf8"));
  
  // Oracle kontratını al
  const oracle = await ethers.getContractAt("DummyOracle", deployOutput.Oracle);
  
  // FOOD token adresi
  const foodAddr = deployOutput.FOOD;
  
  // FOOD token fiyatını ayarla (1 FOOD = 1 USD, 18 decimal)
  const foodPriceE18 = ethers.utils.parseEther("1"); // 1 USD
  
  console.log("Oracle adresi:", await oracle.address);
  console.log("FOOD token adresi:", foodAddr);
  console.log("Ayarlanacak fiyat:", ethers.utils.formatEther(foodPriceE18), "USD");
  
  try {
    // FOOD token fiyatını ayarla
    const tx = await oracle.setTokenPrice(foodAddr, foodPriceE18);
    console.log("✅ Fiyat ayarlama işlemi gönderildi:", tx.hash);
    
    // İşlemin tamamlanmasını bekle
    await tx.wait();
    console.log("✅ Fiyat başarıyla ayarlandı!");
    
    // Kontrol et
    const newPrice = await oracle.currentTokenPriceE18(foodAddr);
    console.log("✅ Yeni FOOD token fiyatı:", ethers.utils.formatEther(newPrice), "USD");
    
  } catch (error) {
    console.error("❌ Hata:", error.message);
  }
}

main().catch(console.error);
