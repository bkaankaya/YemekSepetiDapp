const axios = require('axios');

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';

// Test queries
const queries = {
  // Tüm siparişleri getir
  getOrders: `
    query GetOrders {
      orders {
        id
        orderId
        customer
        restaurant
        itemName
        status
        createdAt
        price
        paymentToken
      }
    }
  `,

  // Belirli siparişi getir
  getOrder: `
    query GetOrder($id: ID!) {
      order(id: $id) {
        id
        orderId
        customer
        restaurant
        itemName
        price
        status
        createdAt
        updatedAt
        blockNumber
        transactionHash
      }
    }
  `,

  // Restoranları getir
  getRestaurants: `
    query GetRestaurants {
      restaurants {
        id
        address
        realWorldAddress
        defaultSlippageBps
      }
    }
  `,

  // Müşterileri getir
  getCustomers: `
    query GetCustomers {
      customers {
        id
        address
        realWorldAddress
      }
    }
  `,

  // Yeni sipariş oluştur
  createOrder: `
    mutation CreateOrder($customer: String!, $restaurant: String!, $itemName: String!) {
      createOrder(customer: $customer, restaurant: $restaurant, itemName: $itemName) {
        id
        orderId
        customer
        restaurant
        itemName
        status
        createdAt
      }
    }
  `
};

async function testGraphQL() {
  console.log('🧪 GraphQL API Test Başlıyor...\n');
  console.log(`🔗 Endpoint: ${GRAPHQL_ENDPOINT}\n`);

  try {
    // Test 1: Tüm siparişleri getir
    console.log('📋 Test 1: Tüm siparişleri getir');
    const response1 = await axios.post(GRAPHQL_ENDPOINT, {
      query: queries.getOrders
    });
    console.log('   ✅ Response:', JSON.stringify(response1.data, null, 2));

    // Test 2: Yeni sipariş oluştur
    console.log('\n📝 Test 2: Yeni sipariş oluştur');
    const response2 = await axios.post(GRAPHQL_ENDPOINT, {
      query: queries.createOrder,
      variables: {
        customer: "0x1234567890123456789012345678901234567890",
        restaurant: "0x0987654321098765432109876543210987654321",
        itemName: "Test Pizza"
      }
    });
    console.log('   ✅ Response:', JSON.stringify(response2.data, null, 2));

    // Test 3: Restoranları getir
    console.log('\n🏪 Test 3: Restoranları getir');
    const response3 = await axios.post(GRAPHQL_ENDPOINT, {
      query: queries.getRestaurants
    });
    console.log('   ✅ Response:', JSON.stringify(response3.data, null, 2));

    // Test 4: Müşterileri getir
    console.log('\n👤 Test 4: Müşterileri getir');
    const response4 = await axios.post(GRAPHQL_ENDPOINT, {
      query: queries.getCustomers
    });
    console.log('   ✅ Response:', JSON.stringify(response4.data, null, 2));

    console.log('\n🎉 Tüm testler başarılı!');
    console.log('\n📊 Test Sonuçları:');
    console.log('   - Orders Query: ✅');
    console.log('   - Create Order: ✅');
    console.log('   - Restaurants Query: ✅');
    console.log('   - Customers Query: ✅');

  } catch (error) {
    console.log('❌ Test hatası:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Çözüm:');
      console.log('   1. GraphQL server\'ı başlat: npm run start:server');
      console.log('   2. Server\'ın 4000 portunda çalıştığından emin ol');
      console.log('   3. Tekrar test et');
    }
  }
}

// Test'i çalıştır
testGraphQL();
