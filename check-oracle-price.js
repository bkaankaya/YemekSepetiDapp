const { ethers } = require("hardhat");

async function main() {
  const oracle = await ethers.getContractAt("DummyOracle", "0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650");
  const foodAddr = "0xc351628EB244ec633d5f21fBD6621e1a683B1181";
  
  console.log("=== Oracle FOOD Token Kontrolü ===");
  
  try {
    const price = await oracle.currentTokenPriceE18(foodAddr);
    console.log("✅ FOOD token fiyatı:", ethers.utils.formatEther(price), "USD");
    
    if (price.eq(0)) {
      console.log("❌ FOOD token fiyatı 0 - ayarlanması gerekiyor!");
    }
  } catch (error) {
    console.log("❌ FOOD token fiyatı okunamadı:", error.message);
  }
  
  // ETH fiyatını da kontrol edelim
  try {
    const ethPrice = await oracle.currentEthPriceE18();
    console.log("✅ ETH fiyatı:", ethers.utils.formatEther(ethPrice), "USD");
  } catch (error) {
    console.log("❌ ETH fiyatı okunamadı:", error.message);
  }
}

main().catch(console.error);
