import yemArtifact from '@/abi/YemekSepeti.abi.json' assert { type: 'json' }
import escrowArtifact from '@/abi/Escrow.abi.json' assert { type: 'json' }
import oracleArtifact from '@/abi/Oracle.abi.json' assert { type: 'json' }

const yemAbi = yemArtifact.abi;
const escrowAbi = escrowArtifact.abi;
const oracleAbi = oracleArtifact.abi;

//Kontrat adreslerini burada topladı - GÜNCEL DEPLOY ADRESLERİ (transfer → call ile)
export const YEMEKSEPETI_ADDRESS = "0x6b39b761b1b64C8C095BF0e3Bb0c6a74705b4788" as `0x${string}`;
export const ESCROW_ADDRESS = "0xeC827421505972a2AE9C320302d3573B42363C26" as `0x${string}`;
export const ORACLE_ADDRESS = "0x74Df809b1dfC099E8cdBc98f6a8D1F5c2C3f66f8" as `0x${string}`;
export const FOOD_ADDRESS = "0x3f9A1B67F3a3548e0ea5c9eaf43A402d12b6a273" as `0x${string}`;

export { yemAbi, escrowAbi, oracleAbi }
