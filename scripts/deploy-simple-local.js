const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🏠 YemekSepeti Basit Local Deployment Başlıyor...\n');

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

    console.log('\n🎉 Subgraph başarıyla build edildi!');
    console.log('\n📁 Build dosyaları hazır:');
    console.log('   - build/schema.graphql');
    console.log('   - build/YemekSepeti/YemekSepeti.wasm');
    console.log('   - build/subgraph.yaml');
    
    console.log('\n🚀 Şimdi GraphQL Server\'ı başlat:');
    console.log('   npm run start:server');
    
    console.log('\n🌐 Sonra frontend\'i başlat:');
    console.log('   npm run start:frontend');
    
    console.log('\n💡 GraphQL endpoint: http://localhost:4000/graphql');
    console.log('💡 Frontend: http://localhost:5176');

  } catch (error) {
    console.log('❌ Hata:', error.message);
  }
}

main().catch(console.error);
