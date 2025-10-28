const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔧 Restaurant Slippage Ayarı Yapılıyor...\n");
  
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
  
  console.log("📋 Kontrat adresi:");
  console.log(`   YemekSepeti: ${YEMEKSEPETI_ADDRESS}`);
  
  const [owner] = await ethers.getSigners();
  
  const YemekSepeti = await ethers.getContractFactory("YemekSepeti");
  const yem = YemekSepeti.attach(YEMEKSEPETI_ADDRESS);
  
  const restaurantAddress = "0x01b56546769f424F18d5931303c7E1a4fCE1422B";
  
  try {
    console.log("\n🔍 Restaurant Slippage Ayarı:");
    console.log(`   Restaurant: ${restaurantAddress}`);
    
    // Restaurant owner olarak slippage ayarı yap
    const restaurantOwner = new ethers.Wallet("0x01b56546769f424F18d5931303c7E1a4fCE1422B", owner.provider);
    const yemWithRestaurantOwner = yem.connect(restaurantOwner);
    
    // Default slippage ayarı: %1 (100 bps)
    console.log("   Default Slippage: %1 (100 bps) ayarlanıyor...");
    const tx1 = await yemWithRestaurantOwner.setDefaultSlippageBps(100);
    await tx1.wait();
    console.log("   ✅ Default slippage ayarlandı!");
    
    // Test ürünleri için slippage ayarı: %2 (200 bps)
    const testItems = ["Adana Kebap", "Urfa Kebap", "Tavuk Şiş", "Çoban Salata", "Mercimek Çorbası", "Ayran"];
    
    console.log("\n🔍 Ürün Bazlı Slippage Ayarı:");
    for (const item of testItems) {
      try {
        console.log(`   ${item}: %2 (200 bps) ayarlanıyor...`);
        const tx = await yemWithRestaurantOwner.setItemSlippageBps(item, 200);
        await tx.wait();
        console.log(`   ✅ ${item} slippage ayarlandı!`);
      } catch (error) {
        console.log(`   ❌ ${item} slippage hatası: ${error.message}`);
      }
    }
    
    // Kontrol et
    console.log("\n🔍 Kontrol Ediliyor...");
    const defaultSlippageBps = await yem.restaurants(restaurantAddress).defaultSlippageBps;
    console.log(`   Default Slippage: ${defaultSlippageBps} bps (${defaultSlippageBps/100}%)`);
    
    // Test slippage hesaplama
    const testItems2 = ["Adana Kebap", "Urfa Kebap", "Tavuk Şiş"];
    const testQtys = [2, 2, 1];
    
    try {
      const [totalAmount, mode] = await yem.getRequiredPaymentMany(restaurantAddress, testItems2, testQtys, ethers.constants.AddressZero);
      const totalETH = ethers.utils.formatEther(totalAmount);
      console.log(`   Gerekli ETH: ${totalETH} ETH`);
      
      // Slippage hesaplama
      const slippageBps = defaultSlippageBps;
      const lowWei = totalAmount.mul(10000 - slippageBps).div(10000);
      const highWei = totalAmount.mul(10000 + slippageBps).div(10000);
      
      console.log(`   Slippage: ${slippageBps} bps (${slippageBps/100}%)`);
      console.log(`   Minimum ETH: ${ethers.utils.formatEther(lowWei)} ETH`);
      console.log(`   Maximum ETH: ${ethers.utils.formatEther(highWei)} ETH`);
      console.log(`   Kabul Edilen Aralık: ${ethers.utils.formatEther(highWei - lowWei)} ETH`);
      
    } catch (error) {
      console.error(`   ❌ getRequiredPaymentMany hatası: ${error.message}`);
    }
    
    console.log("\n🎉 Slippage Ayarı Tamamlandı!");
    console.log("💡 Artık %1-%2 tolerans ile ödeme yapabilirsiniz!");
    
  } catch (error) {
    console.error("❌ Genel hata:", error.message);
  }
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
