const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 Contract query test scripti başlatılıyor...");

  // Contract adresleri
  const YEMEKSEPETI_ADDRESS = "0x2bdCC0de6bE1f7D2ee689a0342D76F52E8EFABa3";
  const FOOD_ADDRESS = "0xc351628EB244ec633d5f21fBD6621e1a683B1181";
  const ESCROW_ADDRESS = "0x7969c5eD335650692Bc04293B07F5BF2e7A673C0";

  try {
    // Signer'ları al
    const [owner, customer, restaurantOwner] = await ethers.getSigners();
    console.log("👤 Signer'lar alındı:");
    console.log(`   Owner: ${owner.address}`);
    console.log(`   Customer: ${customer.address}`);
    console.log(`   Restaurant Owner: ${restaurantOwner.address}`);

    // Contract'ları bağla
    const yemekSepeti = await ethers.getContractAt("YemekSepeti", YEMEKSEPETI_ADDRESS);
    const foodToken = await ethers.getContractAt("FOOD", FOOD_ADDRESS);
    const escrow = await ethers.getContractAt("Escrow", ESCROW_ADDRESS);

    console.log("\n📋 Contract'lar bağlandı!");

    // Test 1: Restoran query
    console.log("\n🔍 Test 1: Restoran query...");
    try {
      const restaurant = await yemekSepeti.restaurants(restaurantOwner.address);
      console.log("   ✅ Restoran query başarılı!");
      console.log(`   📍 Gerçek dünya adresi: ${restaurant.realWorldAddress}`);
      console.log(`   💰 Default slippage: ${restaurant.defaultSlippageBps}`);
    } catch (error) {
      console.log("   ❌ Restoran query hatası:", error.message);
    }

    // Test 2: Müşteri query
    console.log("\n🔍 Test 2: Müşteri query...");
    try {
      const customerData = await yemekSepeti.customers(customer.address);
      console.log("   ✅ Müşteri query başarılı!");
      console.log(`   📍 Gerçek dünya adresi: ${customerData.realWorldAddress}`);
    } catch (error) {
      console.log("   ❌ Müşteri query hatası:", error.message);
    }

    // Test 3: FOOD token balance
    console.log("\n🔍 Test 3: FOOD token balance...");
    try {
      const balance = await foodToken.balanceOf(customer.address);
      console.log("   ✅ Token balance query başarılı!");
      console.log(`   🪙 Balance: ${ethers.utils.formatEther(balance)} FOOD`);
    } catch (error) {
      console.log("   ❌ Token balance hatası:", error.message);
    }

    // Test 4: Sipariş sayısı
    console.log("\n🔍 Test 4: Sipariş sayısı...");
    try {
      const orderCount = await yemekSepeti.orderCount();
      console.log("   ✅ Order count query başarılı!");
      console.log(`   📊 Toplam sipariş: ${orderCount.toString()}`);
    } catch (error) {
      console.log("   ❌ Order count hatası:", error.message);
    }

    console.log("\n🎯 Test tamamlandı!");

  } catch (error) {
    console.error("❌ Genel hata:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
