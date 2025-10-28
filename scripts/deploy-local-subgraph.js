const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🏠 YemekSepeti Local Subgraph Deployment Başlıyor...\n');

  // Subgraph klasörüne geç
  const subgraphPath = path.join(__dirname, '..', 'yemeksepeti-subgraph');
  
  if (!fs.existsSync(subgraphPath)) {
    console.log('❌ Subgraph klasörü bulunamadı!');
    console.log('   Önce subgraph oluşturulmalı.');
    return;
  }

  try {
    // Subgraph klasörüne geç
    process.chdir(subgraphPath);
    console.log(`📁 Subgraph klasörüne geçildi: ${subgraphPath}`);

    // Build et
    console.log('\n🔨 Subgraph build ediliyor...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build başarılı!');

    // Local Graph Node kontrol et
    console.log('\n🔍 Local Graph Node kontrol ediliyor...');
    try {
      execSync('docker ps --filter "name=graph-node" --format "table {{.Names}}\t{{.Status}}"', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Local Graph Node çalışmıyor!');
      console.log('💡 Docker ile Graph Node başlatılıyor...');
      execSync('docker run -d --name graph-node -p 8000:8000 -p 8001:8001 -p 8020:8020 -p 8030:8030 -p 8040:8040 graphprotocol/graph-node:latest', { stdio: 'inherit' });
      console.log('⏳ Graph Node başlatılıyor, 30 saniye bekle...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }

    // Local deploy et
    console.log('\n🚀 Local Subgraph deploy ediliyor...');
    execSync('graph deploy --node http://localhost:8020 --ipfs http://localhost:5001 yemeksepeti-subgraph', { stdio: 'inherit' });
    
    console.log('\n🎉 Local Subgraph başarıyla deploy edildi!');
    console.log('\n🔗 Local Endpoints:');
    console.log('   GraphQL: http://localhost:8000/graphql');
    console.log('   GraphiQL: http://localhost:8000/graphiql');
    console.log('   Subgraph: http://localhost:8000/subgraphs/name/yemeksepeti-subgraph');
    
    console.log('\n📊 Test Queries:');
    console.log('   curl -X POST http://localhost:8000/graphql');
    console.log('     -H "Content-Type: application/json"');
    console.log('     -d \'{"query":"{ orders { id orderId customer restaurant itemName status } }"}\'');

  } catch (error) {
    console.log('❌ Hata:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Çözüm:');
      console.log('   1. Docker\'ın çalıştığından emin ol');
      console.log('   2. Graph Node container\'ının başladığından emin ol');
      console.log('   3. Portların açık olduğundan emin ol');
    }
  }
}

main().catch(console.error);
