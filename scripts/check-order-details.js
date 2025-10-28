const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔍 Sipariş Detayları Kontrol Ediliyor...\n");

  // Deploy output'dan kontrat adreslerini oku
  const deployOutput = JSON.parse(fs.readFileSync("deploy-output.json", "utf8"));
  const YEMEKSEPETI_ADDRESS = deployOutput.YemekSepeti;
  
  console.log(`📋 Kontrat adresleri:`);
  console.log(`📋 YemekSepeti: ${YEMEKSEPETI_ADDRESS}\n`);

  // BELİRTİLEN ADRESLER
  const CUSTOMER_ADDR = "0x12D7c52D054959698c9c8496732BBe6c22706C39";
  const RESTAURANT_ADDR = "0x01b56546769f424F18d5931303c7E1a4fCE1422B";

  // Signer'ları al
  const [owner, restaurantOwner, customer] = await ethers.getSigners();
  
  console.log(`👤 Kullanıcı adresleri:`);
  console.log(`   Owner: ${owner.address}`);
  console.log(`   Restaurant Owner: ${restaurantOwner.address} (${RESTAURANT_ADDR})`);
  console.log(`   Customer: ${customer.address} (${CUSTOMER_ADDR})\n`);

  // YemekSepeti kontratını bağla
  const YemekSepeti = await ethers.getContractFactory("YemekSepeti");
  const yem = YemekSepeti.attach(YEMEKSEPETI_ADDRESS);

  console.log("🔍 Sipariş detayları kontrol ediliyor...\n");

  try {
    // Önce contract'ın hangi fonksiyonları desteklediğini kontrol et
    console.log("📋 Contract fonksiyonları kontrol ediliyor...");
    
    // Sipariş sayısını farklı yollarla kontrol et
    let totalOrders = 0;
    
    try {
      // Method 1: getTotalOrders fonksiyonu varsa
      totalOrders = await yem.getTotalOrders();
      console.log(`✅ getTotalOrders fonksiyonu bulundu`);
    } catch (e) {
      console.log(`⚠️  getTotalOrders fonksiyonu bulunamadı, alternatif yöntem deneniyor...`);
      
      try {
        // Method 2: orderCount mapping'i varsa
        totalOrders = await yem.orderCount();
        console.log(`✅ orderCount mapping bulundu`);
      } catch (e2) {
        console.log(`⚠️  orderCount mapping de bulunamadı`);
        
        try {
          // Method 3: orders array length
          totalOrders = await yem.getOrdersLength();
          console.log(`✅ getOrdersLength fonksiyonu bulundu`);
        } catch (e3) {
          console.log(`⚠️  Hiçbir sipariş sayısı fonksiyonu bulunamadı`);
          totalOrders = 0;
        }
      }
    }

    console.log(`📊 Toplam sipariş sayısı: ${totalOrders}`);

    // totalOrders'ı number olarak kontrol et (BigNumber değil)
    if (totalOrders === 0 || totalOrders.eq === undefined || totalOrders.eq(0)) {
      console.log("✅ Henüz hiç sipariş yok!");
      return;
    }

    // Her siparişi detaylı olarak kontrol et
    console.log(`\n📋 Sipariş Detayları:\n`);

    for (let i = 0; i < totalOrders; i++) {
      try {
        const order = await yem.orders(i);
        
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

        // Ödeme yöntemini belirle
        const paymentMethod = order.paymentToken === ethers.constants.AddressZero ? 'ETH' : 'Token';
        
        // Sipariş türünü belirle
        let orderType = "Bilinmeyen";
        if (order.customer.toLowerCase() === CUSTOMER_ADDR.toLowerCase()) {
          orderType = "👤 Müşteri Siparişi";
        } else if (order.restaurant.toLowerCase() === RESTAURANT_ADDR.toLowerCase()) {
          orderType = "🏪 Restoran Siparişi";
        }

        console.log(`📦 Sipariş #${i}:`);
        console.log(`   🆔 ID: ${i}`);
        console.log(`   📋 Tür: ${orderType}`);
        console.log(`   👤 Müşteri: ${order.customer}`);
        console.log(`   🏪 Restoran: ${order.restaurant}`);
        console.log(`   🍽️  Ürün: ${order.itemName}`);
        console.log(`   🔢 Miktar: ${order.quantity}`);
        console.log(`   💰 Toplam: ${ethers.utils.formatEther(order.totalAmount)} ETH`);
        console.log(`   📅 Tarih: ${new Date(order.timestamp * 1000).toLocaleString()}`);
        console.log(`   📊 Durum: ${statusText}`);
        console.log(`   💳 Ödeme Yöntemi: ${paymentMethod}`);
        
        // Adres kontrolü
        if (order.customer.toLowerCase() === CUSTOMER_ADDR.toLowerCase()) {
          console.log(`   ✅ Müşteri adresi doğru!`);
        } else {
          console.log(`   ❌ Müşteri adresi yanlış! Beklenen: ${CUSTOMER_ADDR}`);
        }
        
        if (order.restaurant.toLowerCase() === RESTAURANT_ADDR.toLowerCase()) {
          console.log(`   ✅ Restoran adresi doğru!`);
        } else {
          console.log(`   ❌ Restoran adresi yanlış! Beklenen: ${RESTAURANT_ADDR}`);
        }
        
        if (i < totalOrders - 1) console.log(""); // Ayırıcı

      } catch (error) {
        console.log(`❌ Sipariş #${i} okunamadı: ${error.message}`);
      }
    }

    // Özet
    console.log(`\n📊 ÖZET:`);
    console.log(`   📦 Toplam Sipariş: ${totalOrders}`);
    console.log(`   👤 Müşteri Siparişleri: ${totalOrders > 0 ? "Kontrol edildi" : "Yok"}`);
    console.log(`   🏪 Restoran Siparişleri: ${totalOrders > 0 ? "Kontrol edildi" : "Yok"}`);

    console.log("\n🎉 Sipariş detay kontrolü tamamlandı!");

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
