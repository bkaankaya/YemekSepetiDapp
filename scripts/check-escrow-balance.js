const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔍 Escrow Para Durumu Kontrol Ediliyor...\n");

  // Deploy output'dan kontrat adreslerini oku
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const ESCROW_ADDRESS = deployOutput.Escrow;
  const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
  
  console.log(`📋 Kontrat adresleri:`);
  console.log(`   Escrow: ${ESCROW_ADDRESS}`);
  console.log(`   YemekSepeti: ${YEMEKSEPETI_ADDRESS}\n`);

  // Signer'ları al
  const [owner, restaurantOwner, customer] = await ethers.getSigners();
  
  console.log(`👤 Kullanıcı adresleri:`);
  console.log(`   Owner: ${owner.address}`);
  console.log(`   Restaurant Owner: ${restaurantOwner.address}`);
  console.log(`   Customer: ${customer.address}\n`);

  // Escrow kontratını bağla
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = Escrow.attach(ESCROW_ADDRESS);

  // YemekSepeti kontratını bağla
  const YemekSepeti = await ethers.getContractFactory("YemekSepeti");
  const yem = YemekSepeti.attach(YEMEKSEPETI_ADDRESS);

  try {
    // Escrow'un ETH bakiyesi
    const escrowBalance = await ethers.provider.getBalance(ESCROW_ADDRESS);
    console.log(`💰 Escrow ETH Bakiyesi: ${ethers.utils.formatEther(escrowBalance)} ETH`);

    // Toplam sipariş sayısını kontrol et
    let totalOrders = 0;
    try {
      totalOrders = await yem.getTotalOrders();
    } catch (e) {
      try {
        totalOrders = await yem.orderCount();
      } catch (e2) {
        console.log("⚠️  Sipariş sayısı alınamadı");
      }
    }

    console.log(`📦 Toplam Sipariş Sayısı: ${totalOrders}`);

    if (totalOrders > 0) {
      console.log(`\n🔍 Sipariş Detayları:`);
      
      for (let i = 0; i < totalOrders; i++) {
        try {
          const order = await yem.orders(i);
          
          // Escrow'daki hold amount'u kontrol et
          const holdAmount = await escrow.getHoldAmount(i);
          
          // Sipariş durumunu metin olarak çevir
          let statusText;
          switch (order.status) {
            case 0: statusText = "Beklemede"; break;
            case 1: statusText = "Onaylandı"; break;
            case 2: statusText = "İptal Edildi"; break;
            case 3: statusText = "Hazırlanıyor"; break;
            case 4: statusText = "Teslimatta"; break;
            case 5: statusText = "Tamamlandı"; break;
            default: statusText = `Bilinmeyen (${order.status})`;
          }

          console.log(`\n📦 Sipariş #${i}:`);
          console.log(`   🆔 ID: ${i}`);
          console.log(`   👤 Müşteri: ${order.customer}`);
          console.log(`   🏪 Restoran: ${order.restaurant}`);
          console.log(`   🍽️  Ürün: ${order.itemName}`);
          console.log(`   🔢 Miktar: ${order.quantity}`);
          console.log(`   💰 Toplam: ${ethers.utils.formatEther(order.totalAmount)} ETH`);
          console.log(`   📊 Durum: ${statusText}`);
          console.log(`   💳 Escrow'da Tutulan: ${ethers.utils.formatEther(holdAmount)} ETH`);
          
          if (holdAmount.gt(0)) {
            console.log(`   ✅ Para Escrow'da bekliyor!`);
          } else {
            console.log(`   ❌ Escrow'da para yok!`);
          }
          
        } catch (error) {
          console.log(`❌ Sipariş #${i} okunamadı: ${error.message}`);
        }
      }
    }

    console.log("\n🎉 Escrow para durumu kontrolü tamamlandı!");

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
