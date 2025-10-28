// GraphQL API Test Script
// Using built-in fetch (Node.js 18+)

const GRAPHQL_ENDPOINT = 'http://localhost:4000/';
const SUBGRAPH_ENDPOINT = 'http://localhost:8000/subgraphs/name/yemeksepeti-subgraph';

// Test queries
const testQueries = [
  {
    name: 'Get All Orders',
    query: `
      query {
        orders {
          id
          orderId
          itemName
          status
          customer {
            walletAddress
          }
          restaurant {
            walletAddress
          }
        }
      }
    `
  },
  {
    name: 'Get All Restaurants',
    query: `
      query {
        restaurants {
          id
          walletAddress
          realWorldAddress
          defaultSlippageBps
        }
      }
    `
  },
  {
    name: 'Get All Customers',
    query: `
      query {
        customers {
          id
          walletAddress
          realWorldAddress
        }
      }
    `
  },
  {
    name: 'Get All Menu Items',
    query: `
      query {
        menuItems {
          id
          name
          priceQuote
          priceQuoteDecimals
          acceptedTokens
          restaurant {
            walletAddress
          }
        }
      }
    `
  }
];

async function testGraphQL() {
  console.log('🧪 Testing GraphQL API...\n');
  
  for (const test of testQueries) {
    try {
      console.log(`📋 Testing: ${test.name}`);
      
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: test.query,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success: ${data.data ? 'Data received' : 'No data'}`);
        
        if (data.data) {
          const result = data.data[Object.keys(data.data)[0]];
          if (Array.isArray(result)) {
            console.log(`   📊 Count: ${result.length}`);
            if (result.length > 0) {
              console.log(`   🔍 Sample: ${JSON.stringify(result[0], null, 2)}`);
            }
          }
        }
      } else {
        console.log(`❌ Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Exception: ${error.message}`);
    }
    
    console.log('');
  }
}

async function testSubgraphDirectly() {
  console.log('🔗 Testing Subgraph Directly...\n');
  
  try {
    const response = await fetch(SUBGRAPH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            orders {
              id
              orderId
              itemName
              status
            }
          }
        `,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Subgraph is accessible');
      console.log(`📊 Orders count: ${data.data?.orders?.length || 0}`);
    } else {
      console.log(`❌ Subgraph error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Subgraph exception: ${error.message}`);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 YemekSepeti GraphQL API Test Suite\n');
  console.log(`🔗 GraphQL Endpoint: ${GRAPHQL_ENDPOINT}`);
  console.log(`🔗 Subgraph Endpoint: ${SUBGRAPH_ENDPOINT}\n`);
  
  await testGraphQL();
  await testSubgraphDirectly();
  
  console.log('✨ Test suite completed!');
}

runTests().catch(console.error);
