const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔍 Oracle Fiyatları Kontrol Ediliyor...\n");

  // Deploy output'dan kontrat adreslerini oku
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const ORACLE_ADDRESS = deployOutput.Oracle;
  const FOOD_TOKEN_ADDRESS = deployOutput.FOOD;
  
  console.log(`📋 Kontrat adresleri:`);
  console.log(`   Oracle: ${ORACLE_ADDRESS}`);
  console.log(`   FOOD Token: ${FOOD_TOKEN_ADDRESS}\n`);

  // Signer'ları al
  const [owner, restaurantOwner, customer] = await ethers.getSigners();
  
  // Oracle kontratını bağla
  const Oracle = await ethers.getContractFactory("DummyOracle");
  const oracle = Oracle.attach(ORACLE_ADDRESS);

  try {
    // Mevcut fiyatları kontrol et
    console.log("💰 Mevcut Oracle Fiyatları:");
    
    const ethPrice = await oracle.currentEthPriceE18();
    console.log(`   ETH Fiyatı: $${ethers.utils.formatEther(ethPrice)}`);
    
    const foodPrice = await oracle.currentTokenPriceE18(FOOD_TOKEN_ADDRESS);
    console.log(`   FOOD Fiyatı: $${ethers.utils.formatEther(foodPrice)}`);

    // Fiyatları güncelleyelim
    console.log("\n🔄 Oracle fiyatları güncelleniyor...");
    
    // Güncel ETH fiyatı: ~$3000
    const newEthPrice = ethers.utils.parseUnits("3000", 18);
    const ethTx = await oracle.setEthPrice(newEthPrice);
    await ethTx.wait();
    console.log(`✅ ETH fiyatı güncellendi: $3000`);

    // FOOD token fiyatı: $1
    const newFoodPrice = ethers.utils.parseUnits("1", 18);
    const foodTx = await oracle.setTokenPrice(FOOD_TOKEN_ADDRESS, newFoodPrice);
    await foodTx.wait();
    console.log(`✅ FOOD fiyatı güncellendi: $1`);

    // Güncellenmiş fiyatları kontrol et
    console.log("\n💰 Güncellenmiş Oracle Fiyatları:");
    
    const updatedEthPrice = await oracle.currentEthPriceE18();
    console.log(`   ETH Fiyatı: $${ethers.utils.formatEther(updatedEthPrice)}`);
    
    const updatedFoodPrice = await oracle.currentTokenPriceE18(FOOD_TOKEN_ADDRESS);
    console.log(`   FOOD Fiyatı: $${ethers.utils.formatEther(updatedFoodPrice)}`);

    console.log("\n🎉 Oracle fiyatları başarıyla güncellendi!");
    console.log("📋 Artık hem ETH hem FOOD token ile ödeme yapabilirsiniz!");
    
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
