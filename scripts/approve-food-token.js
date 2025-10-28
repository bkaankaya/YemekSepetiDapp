const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🪙 FOOD Token Onayı (Allowance) Yapılıyor...\n");

  // Deploy output'dan kontrat adreslerini oku
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const FOOD_TOKEN_ADDRESS = deployOutput.FOOD;
  const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
  
  console.log(`📋 Kontrat adresleri:`);
  console.log(`   FOOD Token: ${FOOD_TOKEN_ADDRESS}`);
  console.log(`   YemekSepeti: ${YEMEKSEPETI_ADDRESS}\n`);

  // Signer'ları al
  const [owner, customer] = await ethers.getSigners();
  
  console.log(`👤 Kullanıcı adresleri:`);
  console.log(`   Owner/Restaurant: ${owner.address}`);
  console.log(`   Customer: ${customer.address}\n`);

  // FOOD Token kontratını bağla
  const FOOD = await ethers.getContractAt("FOOD", FOOD_TOKEN_ADDRESS, customer);

  // Müşterinin FOOD bakiyesini kontrol et
  const customerFoodBalance = await FOOD.balanceOf(customer.address);
  console.log(`Müşterinin FOOD bakiyesi: ${ethers.utils.formatEther(customerFoodBalance)} FOOD`);

  // YemekSepeti kontratına sınırsız onay ver
  const amountToApprove = ethers.constants.MaxUint256; // Sınırsız onay

  console.log(`YemekSepeti kontratına FOOD harcama onayı veriliyor...`);
  const tx = await FOOD.approve(YEMEKSEPETI_ADDRESS, amountToApprove);
  await tx.wait();
  console.log(`✅ Onay işlemi başarılı! Transaction Hash: ${tx.hash}`);

  const allowance = await FOOD.allowance(customer.address, YEMEKSEPETI_ADDRESS);
  console.log(`YemekSepeti kontratının müşteri adına harcayabileceği miktar: ${ethers.utils.formatEther(allowance)} FOOD\n`);

  console.log("🎉 FOOD Token Onay işlemi tamamlandı!");
  console.log("📋 Artık Customer FOOD token ile sipariş verebilir!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
