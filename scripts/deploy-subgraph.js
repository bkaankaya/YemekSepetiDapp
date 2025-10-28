const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 YemekSepeti Subgraph Deployment Başlıyor...\n');

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

    // Deploy et
    console.log('\n🚀 Subgraph deploy ediliyor...');
    console.log('⚠️  Bu işlem için The Graph Deploy Key gerekli!');
    console.log('💡 Deploy Key almak için: https://thegraph.com/hosted-service/');
    console.log('   1. GitHub ile giriş yap');
    console.log('   2. "Add Subgraph" tıkla');
    console.log('   3. Deploy key kopyala');
    
    // Deploy key al
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('The Graph Deploy Key\'inizi girin: ', async (deployKey) => {
      try {
        // Authentication
        console.log('\n🔐 The Graph authentication yapılıyor...');
        execSync(`graph auth ${deployKey}`, { stdio: 'inherit' });
        
        // Deploy
        console.log('\n🚀 Subgraph deploy ediliyor...');
        execSync(`graph deploy --node https://api.thegraph.com/deploy/ yemeksepeti-subgraph`, { stdio: 'inherit' });
        
        console.log('\n🎉 Subgraph başarıyla deploy edildi!');
        console.log(`🔗 Subgraph URL: https://thegraph.com/hosted-service/bkaankaya/yemeksepeti-subgraph`);
        
      } catch (error) {
        console.log('❌ Deploy hatası:', error.message);
      } finally {
        rl.close();
      }
    });

  } catch (error) {
    console.log('❌ Hata:', error.message);
  }
}

main().catch(console.error);
