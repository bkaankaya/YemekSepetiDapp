import { ethers } from "ethers";
import { YEMEKSEPETI_ADDRESS, ESCROW_ADDRESS } from "./contracts";
import YemekSepetiArtifact from "../abi/YemekSepeti.abi.json";
import EscrowArtifact from "../abi/Escrow.abi.json";

const YemekSepetiAbi = YemekSepetiArtifact.abi;
const EscrowAbi = (EscrowArtifact as any).abi;

export const ERC20_MIN = [
  "function decimals() view returns (uint8)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)"
];

export async function getClients() {
  const ethereum = (window as any).ethereum;
  if (!ethereum) throw new Error("MetaMask bulunamadı. Lütfen yükleyip tekrar deneyin.");

  // Önce 31337'ye geç veya ekle
  try {
    await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x7A69' }] });
  } catch (switchErr: any) {
    if (switchErr?.code === 4902) {
      // Ağ MetaMask'te kayıtlı değilse ekle
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x7A69',
          chainName: 'Hardhat Localhost',
          rpcUrls: ['http://127.0.0.1:8545'],
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
        }]
      });
    } else {
      throw switchErr;
    }
  }

  // Network bilgisiyle provider oluştur
  const provider = new ethers.providers.Web3Provider(ethereum, {
    chainId: 31337,
    name: 'hardhat'
  });
  
  // ENS resolveName metodunu override et
  provider.resolveName = async (name: string) => {
    // Eğer zaten adres ise, direkt döndür
    if (ethers.utils.isAddress(name)) {
      return name;
    }
    throw new Error("ENS desteklenmiyor");
  };
  
  await provider.send("eth_requestAccounts", []);
  const net = await provider.getNetwork();
  if (net.chainId !== 31337) throw new Error("Metamask ağı Localhost (31337) olmalı");
  const signer = provider.getSigner();

  return {
    provider,
    signer,
    yem:    new ethers.Contract(YEMEKSEPETI_ADDRESS, YemekSepetiAbi, signer),
    escrow: new ethers.Contract(ESCROW_ADDRESS,      EscrowAbi as any,      signer),
  };
}

export async function ensureCustomerRegistered(yem: ethers.Contract, signer: ethers.Signer, realWorldAddress = "Web Client") {
  const me = await signer.getAddress();
  const rec: any = await yem.customers(me);
  const wallet = rec?.walletAddress ?? rec?.[0];
  if (!wallet || wallet === ethers.constants.AddressZero) {
    const tx = await yem.registerCustomer(realWorldAddress);
    await tx.wait();
  }
}
