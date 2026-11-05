import {ethers} from 'ethers';
import {YEMEKSEPETI_ADDRESS,ESCROW_ADDRESS} from './contracts';
import YemekSepetiArtifact from '../abi/YemekSepeti.abi.json';
import EscrowArtifact from '../abi/Escrow.abi.json';
const YemekSepetiAbi=YemekSepetiArtifact.abi;
const EscrowAbi=(EscrowArtifact as any).abi;
export const ERC20_MIN=['function decimals() view returns (uint8)','function allowance(address,address) view returns (uint256)','function approve(address,uint256) returns (bool)'];
export async function getClients(){
 const ethereum=(window as any).ethereum;
 if(!ethereum?.request)throw new Error('MetaMask bulunamadı. Lütfen cüzdan bağla.');
 // Never silently switch wallet networks during financial operations.
 const chainId=await ethereum.request({method:'eth_chainId'});
 if(parseInt(chainId as string,16)!==31337)throw new Error('Yanlış ağ. Localhost (31337) gerekli.');
 await ethereum.request({method:'eth_requestAccounts'});
 const provider=new ethers.providers.Web3Provider(ethereum,'any');
 if((await provider.getNetwork()).chainId!==31337)throw new Error('Yanlış ağ. Localhost (31337) gerekli.');
 const signer=provider.getSigner();
 provider.resolveName=async(name:string)=>{if(ethers.utils.isAddress(name))return name;throw new Error('Geçerli cüzdan adresi gerekli.');};
 return {provider,signer,yem:new ethers.Contract(YEMEKSEPETI_ADDRESS,YemekSepetiAbi,signer),escrow:new ethers.Contract(ESCROW_ADDRESS,EscrowAbi as any,signer)};
}
export async function ensureCustomerRegistered(yem:ethers.Contract,signer:ethers.Signer,realWorldAddress='Web Client'){
 const me=await signer.getAddress();const rec:any=await yem.customers(me);const wallet=rec?.walletAddress??rec?.[0];
 if(!wallet||wallet===ethers.constants.AddressZero){const receipt=await(await yem.registerCustomer(realWorldAddress)).wait();if(receipt?.status===0)throw new Error('Müşteri kaydı başarısız.');}
}
