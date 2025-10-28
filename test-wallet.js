const hre = require("hardhat");

async function main() {
  try {
    console.log("🔍 Cüzdan bağlantısı test ediliyor...");
    
    const signers = await hre.ethers.getSigners();
    const deployer = signers[0];
    
    console.log("✅ Cüzdan bağlandı!");
    console.log("📍 Adres:", deployer.address);
    console.log("💰 Bakiye:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");
    
    const network = await hre.ethers.provider.getNetwork();
    console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId, ")");
    
  } catch (error) {
    console.error("❌ Hata:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Kritik hata:", error);
    process.exit(1);
  });
