import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config();

const rpc = process.env.RPC_URL || "http://127.0.0.1:8545";
const pk  = process.env.PRIVATE_KEY!;
export const provider = new ethers.providers.JsonRpcProvider(rpc);
export const signer = new ethers.Wallet(pk, provider);

// deploy-output.json proje kökünde
const deployedPath = path.join(process.cwd(), "deploy-output.json");
const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf8"));

// artifacts yolu: artifacts/contracts/<Dosya>.sol/<Sözleşme>.json
function abiOf(file: string, name: string) {
  const p = path.join(process.cwd(), "artifacts", "contracts", file, `${name}.json`);
  return JSON.parse(fs.readFileSync(p, "utf8")).abi;
}

export const sepet  = new ethers.Contract(
  deployed.YemekSepeti,
  abiOf("YemekSepeti.sol", "YemekSepeti"),
  signer
);

// Oracle sözleşmesinin class adı "DummyOracle", dosyan "Oracle.sol"
export const oracle = new ethers.Contract(
  deployed.Oracle,
  abiOf("Oracle.sol", "DummyOracle"),
  signer
);
