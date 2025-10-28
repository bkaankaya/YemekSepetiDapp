const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 YemekSepeti DApp Deploy Başlıyor...");
  
  try {
    // 1) YemekSepeti kontratını deploy et
    console.log("📦 YemekSepeti kontratı deploy ediliyor...");
    const YemekSepeti = await hre.ethers.getContractFactory("YemekSepeti");
    const sepet = await YemekSepeti.deploy();
    await sepet.deployed();
    console.log("✅ YemekSepeti deployed:", sepet.address);

    // 2) Escrow kontratını deploy et
    console.log("📦 Escrow kontratı deploy ediliyor...");
    const Escrow = await hre.ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy(sepet.address);
    await escrow.deployed();
    console.log("✅ Escrow deployed:", escrow.address);

    // 3) Oracle kontratını deploy et
    console.log("📦 Oracle kontratı deploy ediliyor...");
    const Oracle = await hre.ethers.getContractFactory("DummyOracle");
    const oracle = await Oracle.deploy();
    await oracle.deployed();
    console.log("✅ Oracle deployed:", oracle.address);

    // 4) FOOD ERC20 Token deploy et
    console.log("📦 FOOD Token deploy ediliyor...");
    const FOOD = await hre.ethers.getContractFactory("FOOD");
    const token = await FOOD.deploy();
    await token.deployed();
    console.log("✅ FOOD Token deployed:", token.address);

    // 5) Contract'ları birbirine bağla
    console.log("🔗 Contract'lar birbirine bağlanıyor...");
    
    // Escrow adresini YemekSepeti'ne set et
    const tx1 = await sepet.setEscrow(escrow.address);
    await tx1.wait(1); // 1 confirmation bekle
    console.log("✅ Escrow adresi YemekSepeti'ne set edildi");
    
    // Oracle adresini YemekSepeti'ne set et
    const tx2 = await sepet.setOracle(oracle.address);
    await tx2.wait(1);
    console.log("✅ Oracle adresi YemekSepeti'ne set edildi");

    // 6) Oracle fiyatlarını ayarla
    console.log("💰 Oracle fiyatları ayarlanıyor...");
    
    const ethPrice = hre.ethers.utils.parseUnits("3000", 18); // 1 ETH = 3000 USD
    const tokenPrice = hre.ethers.utils.parseUnits("1", 18); // 1 FOOD = 1 USD
    
    const tx3 = await oracle.setEthPrice(ethPrice);
    await tx3.wait(1);
    console.log("✅ ETH fiyatı: $3000");
    
    const tx4 = await oracle.setTokenPrice(token.address, tokenPrice);
    await tx4.wait(1);
    console.log("✅ FOOD fiyatı: $1");

    // 7) Contract doğrulama
    console.log("🔍 Contract'lar doğrulanıyor...");
    
    const provider = hre.ethers.provider;
    
    // Her contract'ın kodunu kontrol et
    const contracts = [
      { name: "YemekSepeti", address: sepet.address },
      { name: "Escrow", address: escrow.address },
      { name: "Oracle", address: oracle.address },
      { name: "FOOD Token", address: token.address }
    ];
    
    for (const contract of contracts) {
      const code = await provider.getCode(contract.address);
      if (code === "0x") {
        throw new Error(`❌ ${contract.name} contract not found at address: ${contract.address}`);
      }
      console.log(`✅ ${contract.name} contract verified at: ${contract.address}`);
    }

    // 8) Adresleri dosyaya yaz
    const deployOutput = {
      YemekSepeti: sepet.address,
      Escrow: escrow.address,
      Oracle: oracle.address,
      FOOD: token.address,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync("deploy-output.json", JSON.stringify(deployOutput, null, 2));
    console.log("📄 Deploy sonuçları deploy-output.json'a kaydedildi");

    // 9) Cüzdanlara otomatik bakiye ekle
    console.log("💰 Cüzdanlara otomatik bakiye ekleniyor...");
    
    const signers = await hre.ethers.getSigners();
    const owner = signers[0];
    const transferAmount = hre.ethers.utils.parseEther("100");
    
    console.log(`📤 Her cüzdana ${hre.ethers.utils.formatEther(transferAmount)} ETH transfer ediliyor...`);
    
    for (let i = 1; i < signers.length; i++) {
      const targetSigner = signers[i];
      const walletType = i === 1 ? 'Restaurant' : 'Customer';
      
      console.log(`   ${walletType} cüzdanına transfer...`);
      
      const tx = await owner.sendTransaction({
        to: targetSigner.address,
        value: transferAmount,
        gasLimit: 500000 // Explicit gas limit
      });
      await tx.wait(1);
      console.log(`   ✅ ${walletType} cüzdanına ETH transfer edildi!`);
    }

    console.log("\n🎉 DEPLOY BAŞARILI!");
    console.log("\n📋 KONTRAAT ADRESLERİ:");
    console.log("YemekSepeti:", sepet.address);
    console.log("Escrow:", escrow.address);
    console.log("Oracle:", oracle.address);
    console.log("FOOD token:", token.address);
    
    console.log("\n🔧 KONTRAAT AYARLARI:");
    console.log("✅ Escrow adresi YemekSepeti'ne set edildi");
    console.log("✅ Oracle adresi YemekSepeti'ne set edildi");
    console.log("✅ ETH fiyatı: $3000");
    console.log("✅ FOOD fiyatı: $1");
    console.log("✅ Tüm cüzdanlar fonlandı");
    
  } catch (error) {
    console.error("❌ Deploy hatası:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
