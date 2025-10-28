const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 YemekSepeti Kontratları Sepolia'da Deploy Ediliyor...\n");

  // Sepolia ağında deploy et
  const network = await hre.ethers.provider.getNetwork();
  if (network.chainId !== 11155111) {
    throw new Error("❌ Bu script sadece Sepolia ağında çalışır! (Chain ID: 11155111)");
  }

  console.log("✅ Sepolia ağında deploy başlıyor...\n");

  // 1) YemekSepeti kontratını deploy et
  console.log("📋 YemekSepeti kontratı deploy ediliyor...");
  const YemekSepeti = await hre.ethers.getContractFactory("YemekSepeti");
  const sepet = await YemekSepeti.deploy();
  await sepet.deployed();
  console.log("✅ YemekSepeti deployed:", sepet.address);

  // 2) Escrow kontratını deploy et
  console.log("📋 Escrow kontratı deploy ediliyor...");
  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(sepet.address);
  await escrow.deployed();
  console.log("✅ Escrow deployed:", escrow.address);

  // 3) Oracle kontratını deploy et
  console.log("📋 Oracle kontratı deploy ediliyor...");
  const Oracle = await hre.ethers.getContractFactory("DummyOracle");
  const oracle = await Oracle.deploy();
  await oracle.deployed();
  console.log("✅ Oracle deployed:", oracle.address);

  // 4) FOOD ERC20 Token deploy et
  console.log("📋 FOOD Token deploy ediliyor...");
  const FOOD = await hre.ethers.getContractFactory("FOOD");
  const token = await FOOD.deploy();
  await token.deployed();
  console.log("✅ FOOD Token deployed:", token.address);

  // 5) YemekSepeti içinde escrow ve oracle adreslerini ayarla
  console.log("🔧 Kontrat ayarları yapılıyor...");
  await (await sepet.setEscrow(escrow.address)).wait();
  console.log("✅ Escrow adresi YemekSepeti'ne set edildi");
  
  await (await sepet.setOracle(oracle.address)).wait();
  console.log("✅ Oracle adresi YemekSepeti'ne set edildi");

  // 6) Oracle'da fiyatları ayarla
  console.log("💰 Oracle fiyatları ayarlanıyor...");
  await (await oracle.setEthPrice(hre.ethers.utils.parseUnits("3000", 18))).wait(); // 1 ETH = 3000 USD
  console.log("✅ ETH fiyatı: $3000");
  
  await (await oracle.setTokenPrice(token.address, hre.ethers.utils.parseUnits("1", 18))).wait(); // 1 FOOD = 1 USD
  console.log("✅ FOOD fiyatı: $1");

  // 7) Deploy sonuçlarını dosyaya yaz
  const deployOutput = {
    network: "sepolia",
    chainId: 11155111,
    YemekSepeti: sepet.address,
    Escrow: escrow.address,
    Oracle: oracle.address,
    FOOD: token.address,
    deployer: (await hre.ethers.getSigners())[0].address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  fs.writeFileSync(
    "deploy-output-sepolia.json",
    JSON.stringify(deployOutput, null, 2)
  );

  // 8) Sonuçları konsola yaz
  console.log("\n🎉 SEPOLIA DEPLOY BAŞARILI!");
  console.log("📋 DEPLOY SONUÇLARI:");
  console.log("Network:", deployOutput.network);
  console.log("Chain ID:", deployOutput.chainId);
  console.log("YemekSepeti:", deployOutput.YemekSepeti);
  console.log("Escrow:", deployOutput.Escrow);
  console.log("Oracle:", deployOutput.Oracle);
  console.log("FOOD Token:", deployOutput.FOOD);
  console.log("Deployer:", deployOutput.deployer);
  console.log("Block Number:", deployOutput.blockNumber);
  console.log("Timestamp:", deployOutput.timestamp);
  
  console.log("\n📁 Sonuçlar 'deploy-output-sepolia.json' dosyasına kaydedildi");
  console.log("\n🔗 Sepolia Etherscan:");
  console.log(`YemekSepeti: https://sepolia.etherscan.io/address/${deployOutput.YemekSepeti}`);
  console.log(`Escrow: https://sepolia.etherscan.io/address/${deployOutput.Escrow}`);
  console.log(`Oracle: https://sepolia.etherscan.io/address/${deployOutput.Oracle}`);
  console.log(`FOOD Token: https://sepolia.etherscan.io/address/${deployOutput.FOOD}`);
  
  console.log("\n⚠️  ÖNEMLİ: Bu adresleri frontend ve subgraph konfigürasyonlarında güncellemeyi unutmayın!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deploy hatası:", error);
    process.exit(1);
  });
