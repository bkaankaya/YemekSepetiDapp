const { ethers } = require("hardhat");
const fs = require("fs");

// Oracle ve YemekSepeti test ABI'leri
const OracleABI = [
  "function currentEthPriceE18() view returns (uint256)",
  "function currentTokenPriceE18(address) view returns (uint256)",
  "function setEthPrice(uint256) external",
  "function setTokenPrice(address, uint256) external",
  "function hasRole(bytes32, address) view returns (bool)",
  "function FEEDER_ROLE() view returns (bytes32)",
  "function grantRole(bytes32, address) external"
];

const YemekSepetiABI = [
  "function getRequiredPaymentMany(address, string[], uint256[], address) view returns (uint256, uint8)",
  "function orderCount() view returns (uint256)",
  "function oracle() view returns (address)"
];

async function main() {
  console.log("🔍 Oracle ve YemekSepeti Debug İşlemi Başlatılıyor...\n");

  // Deploy output'dan kontrat adreslerini oku
  let deployOutput;
  try {
    deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  } catch (error) {
    console.error("❌ deploy-output.json dosyası bulunamadı!");
    console.log("Lütfen önce kontratları deploy edin: npx hardhat run scripts/deploy.js --network localhost");
    return;
  }

  const {
    Oracle: ORACLE_ADDRESS,
    YemekSepeti: YEMEKSEPETI_ADDRESS,
    FOOD: FOOD_TOKEN_ADDRESS
  } = deployOutput;

  console.log("📋 Kontrat Adresleri:");
  console.log(`   Oracle: ${ORACLE_ADDRESS}`);
  console.log(`   YemekSepeti: ${YEMEKSEPETI_ADDRESS}`);
  console.log(`   FOOD Token: ${FOOD_TOKEN_ADDRESS}\n`);

  // Signer'ları al
  const [owner, restaurantOwner, customer] = await ethers.getSigners();
  console.log("👥 Kullanıcı Adresleri:");
  console.log(`   Owner: ${owner.address}`);
  console.log(`   Restaurant: ${restaurantOwner.address}`);
  console.log(`   Customer: ${customer.address}\n`);

  // 1. ORACLE TESTİ
  console.log("🔮 Oracle Kontratı Test Ediliyor...");
  try {
    const oracle = new ethers.Contract(ORACLE_ADDRESS, OracleABI, owner);
    
    // FEEDER_ROLE kontrolü
    const feederRole = await oracle.FEEDER_ROLE();
    const hasFeederRole = await oracle.hasRole(feederRole, owner.address);
    console.log(`🔐 Owner'ın FEEDER_ROLE yetkisi: ${hasFeederRole ? '✅ Var' : '❌ Yok'}`);
    
    if (!hasFeederRole) {
      console.log("🔧 FEEDER_ROLE yetkisi veriliyor...");
      const tx = await oracle.grantRole(feederRole, owner.address);
      await tx.wait();
      console.log("✅ FEEDER_ROLE yetkisi verildi");
    }
    
    // Mevcut ETH fiyatını kontrol et
    let ethPrice;
    try {
      ethPrice = await oracle.currentEthPriceE18();
      console.log(`📊 Oracle ETH fiyatı: ${ethers.utils.formatEther(ethPrice)} USD`);
      
      if (ethPrice.eq(0)) {
        throw new Error("ETH fiyatı 0");
      }
    } catch (error) {
      console.log("❌ Oracle ETH fiyatı alınamadı:", error.message);
      console.log("🔧 ETH fiyatını manuel olarak ayarlıyoruz...");
      
      // ETH fiyatını $2000 olarak ayarla
      const tx1 = await oracle.setEthPrice(ethers.utils.parseEther("2000"));
      await tx1.wait();
      
      ethPrice = await oracle.currentEthPriceE18();
      console.log(`✅ ETH fiyatı ayarlandı: ${ethers.utils.formatEther(ethPrice)} USD`);
    }

    // FOOD token fiyatını kontrol et
    let foodPrice;
    try {
      foodPrice = await oracle.currentTokenPriceE18(FOOD_TOKEN_ADDRESS);
      console.log(`🪙 FOOD token fiyatı: ${ethers.utils.formatEther(foodPrice)} USD`);
      
      if (foodPrice.eq(0)) {
        throw new Error("FOOD fiyatı 0");
      }
    } catch (error) {
      console.log("❌ FOOD token fiyatı alınamadı:", error.message);
      console.log("🔧 FOOD token fiyatını manuel olarak ayarlıyoruz...");
      
      // FOOD fiyatını $1 olarak ayarla
      const tx2 = await oracle.setTokenPrice(FOOD_TOKEN_ADDRESS, ethers.utils.parseEther("1"));
      await tx2.wait();
      
      foodPrice = await oracle.currentTokenPriceE18(FOOD_TOKEN_ADDRESS);
      console.log(`✅ FOOD fiyatı ayarlandı: ${ethers.utils.formatEther(foodPrice)} USD`);
    }
    
  } catch (error) {
    console.error("❌ Oracle test hatası:", error.message);
    return;
  }

  // 2. YEMEKSEPETI KONTRAT TESTİ
  console.log("\n🍕 YemekSepeti Kontratı Test Ediliyor...");
  try {
    const yemekSepeti = new ethers.Contract(YEMEKSEPETI_ADDRESS, YemekSepetiABI, owner);
    
    // Oracle bağlantısını kontrol et
    const currentOracle = await yemekSepeti.oracle();
    console.log(`🔗 YemekSepeti Oracle adresi: ${currentOracle}`);
    
    if (currentOracle.toLowerCase() !== ORACLE_ADDRESS.toLowerCase()) {
      console.log("❌ Oracle adresi yanlış! Düzeltiliyor...");
      const yemekSepetiOwner = await ethers.getContractAt("YemekSepeti", YEMEKSEPETI_ADDRESS, owner);
      const tx3 = await yemekSepetiOwner.setOracle(ORACLE_ADDRESS);
      await tx3.wait();
      console.log("✅ Oracle adresi düzeltildi");
    } else {
      console.log("✅ Oracle doğru şekilde bağlı");
    }

    const orderCount = await yemekSepeti.orderCount();
    console.log(`📊 Toplam sipariş sayısı: ${orderCount}`);

  } catch (error) {
    console.error("❌ YemekSepeti test hatası:", error.message);
    return;
  }

  // 3. FİYAT HESAPLAMA TESTİ
  console.log("\n💰 Fiyat Hesaplama Test Ediliyor...");
  try {
    const yemekSepeti = new ethers.Contract(YEMEKSEPETI_ADDRESS, YemekSepetiABI, customer);
    
    // Test için örnek veriler
    const testRestaurant = restaurantOwner.address;
    const testItems = ["Adana Kebap"];
    const testQtys = [1];
    
    console.log("🧪 Test Verileri:");
    console.log(`   Restaurant: ${testRestaurant}`);
    console.log(`   Items: ${testItems}`);
    console.log(`   Quantities: ${testQtys}`);

    // ETH ile ödeme testi
    try {
      console.log("\n🔸 ETH ödeme test ediliyor...");
      const ethPayment = await yemekSepeti.getRequiredPaymentMany(
        testRestaurant, 
        testItems, 
        testQtys, 
        ethers.constants.AddressZero
      );
      console.log(`✅ ETH ödeme tutarı: ${ethers.utils.formatEther(ethPayment[0])} ETH`);
    } catch (error) {
      console.log("❌ ETH ödeme hesaplaması başarısız:", error.message);
      console.log("💡 Restaurant menü fiyatları ayarlanmamış olabilir");
    }

    // FOOD token ile ödeme testi
    try {
      console.log("\n🔸 FOOD token ödeme test ediliyor...");
      const tokenPayment = await yemekSepeti.getRequiredPaymentMany(
        testRestaurant, 
        testItems, 
        testQtys, 
        FOOD_TOKEN_ADDRESS
      );
      console.log(`✅ FOOD ödeme tutarı: ${ethers.utils.formatEther(tokenPayment[0])} FOOD`);
    } catch (error) {
      console.log("❌ FOOD ödeme hesaplaması başarısız:", error.message);
      console.log("💡 Restaurant token kabulü ayarlanmamış olabilir");
    }

  } catch (error) {
    console.error("❌ Fiyat hesaplama test hatası:", error.message);
  }

  // 4. KULLANICI BAKİYE KONTROLÜ
  console.log("\n💳 Kullanıcı Bakiyeleri:");
  try {
    // ETH bakiyeleri
    for (const [name, signer] of [['Owner', owner], ['Restaurant', restaurantOwner], ['Customer', customer]]) {
      const balance = await signer.getBalance();
      const formatted = ethers.utils.formatEther(balance);
      const status = balance.gt(ethers.utils.parseEther("0.01")) ? "✅" : "⚠️";
      console.log(`   ${status} ${name}: ${formatted} ETH`);
    }

    // FOOD token bakiyeleri
    const foodContract = await ethers.getContractAt("IERC20", FOOD_TOKEN_ADDRESS);
    for (const [name, signer] of [['Owner', owner], ['Restaurant', restaurantOwner], ['Customer', customer]]) {
      try {
        const balance = await foodContract.balanceOf(signer.address);
        const formatted = ethers.utils.formatEther(balance);
        console.log(`   🪙 ${name}: ${formatted} FOOD`);
      } catch (error) {
        console.log(`   ❌ ${name}: FOOD bakiye alınamadı`);
      }
    }
  } catch (error) {
    console.error("❌ Bakiye kontrolü hatası:", error.message);
  }

  // 5. ÖNERİLER VE ÇÖZÜMLER
  console.log("\n💡 Sonraki Adımlar:");
  console.log("1. Restaurant menü fiyatlarını kaydet:");
  console.log("   npx hardhat run scripts/setup-final-system.js --network localhost");
  
  console.log("\n2. Restaurant token kabulünü aktif et:");
  console.log("   npx hardhat run scripts/setup-eth-acceptance.js --network localhost");
  
  console.log("\n3. Customer FOOD token approve et:");
  console.log("   npx hardhat run scripts/approve-food-token.js --network localhost");

  console.log("\n✅ Oracle Debug İşlemi Tamamlandı!");
  console.log("🎯 Oracle fiyatları ayarlandı. Artık sistem çalışmalı!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Debug script hatası:", error);
    process.exit(1);
  });
