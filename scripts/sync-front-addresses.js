// scripts/sync-front-addresses.js
// deploy-output.json'daki adresleri frontend dosyalarına yazar
const fs = require('fs');
const path = require('path');

function main() {
  const outPath = path.resolve(__dirname, '..', 'deploy-output.json');
  if (!fs.existsSync(outPath)) {
    console.error('deploy-output.json bulunamadı. Önce deploy çalıştırın.');
    process.exit(1);
  }

  const out = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  const { YemekSepeti, Escrow, Oracle, FOOD } = out;

  // frontend/src/lib/contracts.ts
  const contractsTsPath = path.resolve(__dirname, '..', 'frontend', 'src', 'lib', 'contracts.ts');
  const contractsTs = `import yemArtifact from '@/abi/YemekSepeti.abi.json' assert { type: 'json' }
import escrowAbi from '@/abi/Escrow.abi.json' assert { type: 'json' }
import oracleAbi from '@/abi/Oracle.abi.json' assert { type: 'json' }

const yemAbi = yemArtifact.abi;

//Kontrat adreslerini burada topladı - GÜNCEL DEPLOY ADRESLERİ (IOracleV2 ile)
export const YEMEKSEPETI_ADDRESS = "${YemekSepeti}" as \`0x${'${string}'}\`;
export const ESCROW_ADDRESS = "${Escrow}" as \`0x${'${string}'}\`;
export const ORACLE_ADDRESS = "${Oracle}" as \`0x${'${string}'}\`;
export const FOOD_ADDRESS = "${FOOD}" as \`0x${'${string}'}\`;

export { yemAbi, escrowAbi, oracleAbi }
`;
  fs.writeFileSync(contractsTsPath, contractsTs);

  // frontend/src/lib/addresses.ts
  const addressesTsPath = path.resolve(__dirname, '..', 'frontend', 'src', 'lib', 'addresses.ts');
  const addressesTs = `export const ADDRS = {
  YEMEKSEPETI: '${YemekSepeti}',
  ESCROW:      '${Escrow}',
  ORACLE:      '${Oracle}',
  FOOD:        '${FOOD}'
} as const;
`;
  fs.writeFileSync(addressesTsPath, addressesTs);

  console.log('✅ Frontend adresleri güncellendi.');
}

main();


