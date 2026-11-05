import { ethers } from "ethers";
import { YEMEKSEPETI_ADDRESS, ESCROW_ADDRESS } from "./contracts";
import YemekSepetiArtifact from "../abi/YemekSepeti.abi.json";
import type { Restaurant } from "../types";
import { executeQuery, GET_RESTAURANTS } from "./graphql";
const YemekSepetiAbi = YemekSepetiArtifact.abi;

// ---- Backend API entegrasyonu -------------------------------------------
/** Public UI: subgraph is read-only; protected backend/admin routes are not a public catalog. */
export async function fetchRestaurants():Promise<Restaurant[]> {
  return (await fetchRestaurantCatalog()).restaurants;
}
export async function fetchRestaurant(id:string):Promise<Restaurant|null> {
  const {restaurants}=await fetchRestaurantCatalog();
  return restaurants.find(restaurant=>restaurant.id===id||restaurant.walletAddress?.toLowerCase()===id.toLowerCase())??null;
}

export async function fetchRestaurantCatalog():Promise<{restaurants:Restaurant[];source:'graphql'|'sample'}> {
  try{
    type RawMenu={id:string;name:string;priceQuote:string;priceQuoteDecimals:number;acceptedTokens?:string[]};
    type RawRestaurant={id:string;walletAddress:string;realWorldAddress?:string;menuItems?:RawMenu[]};
    const payload=await executeQuery<{restaurants?:RawRestaurant[]}>(GET_RESTAURANTS,{first:100,skip:0});
    if(payload?.restaurants?.length){
      const restaurants:Restaurant[]=payload.restaurants.filter(row=>ethers.utils.isAddress(row.walletAddress)).map(row=>({
        id:String(row.id),
        name:'Restoran '+row.walletAddress.slice(0,6)+'…'+row.walletAddress.slice(-4),
        walletAddress:row.walletAddress,
        address:row.realWorldAddress,
        categories:[],
        menu:(row.menuItems??[]).map(item=>{
          const decimals=Number(item.priceQuoteDecimals)||18,price=Number(item.priceQuote);
          return {
            id:String(item.id),
            name:item.name,
            priceUSD:Number.isFinite(price)&&Number.isInteger(decimals)&&decimals>=0&&decimals<=18?price/10**decimals:0,
          };
        }).filter(item=>item.name&&Number.isFinite(item.priceUSD)&&item.priceUSD>0&&item.priceUSD<100000)
      }));
      if(restaurants.length)return {restaurants,source:'graphql'};
    }
  }catch(error){console.warn('Subgraph kullanılamıyor, demo veri gösteriliyor:',error);}
  const {restaurants}=await import('../data/sample');
  return {restaurants,source:'sample'};
}

// ---- On-chain yardımcılar -------------
const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)", //belirtilen adresin token bakiyesini döner
  "function allowance(address,address) view returns (uint256)", //  Bir adresin başka bir adrese ne kadar harcama yetkisi verdiğini döner
  "function approve(address,uint256) returns (bool)", // Başka bir adrese belirli miktarda token harcama yetkisi verir
];

/**
 * MetaMask veya benzeri wallet provider'ından signer (imzalayıcı) getirir
 * Bu, transaction'ları imzalayabilecek kullanıcının wallet'ını temsil eder
 * @returns {ethers.Signer} Wallet signer'ı
 */
 function getSigner() {
  const provider = new ethers.providers.Web3Provider((window as any).ethereum, {
    name: "localhost",
    chainId: 31337
  });
  return provider.getSigner();
}

/**
 * YemekSepeti kontratına bağlı signer ile kontrat instance'ı oluşturur
 * Bu sayede kontrat fonksiyonlarını çağırıp transaction gönderebiliriz
 * @returns {ethers.Contract} YemekSepeti kontrat instance'ı
 */
function sepetWithSigner() {
  const signer = getSigner();
  return new ethers.Contract(YEMEKSEPETI_ADDRESS, YemekSepetiAbi as any, signer);
}

/**
 * Belirtilen token adresine bağlı ERC20 kontrat instance'ı oluşturur
 * Token approve, balance kontrolü gibi işlemler için kullanılır
 * {string} token - Token kontrat adresi
 *  {ethers.Contract} ERC20 token kontrat instance'ı
 */
function erc20WithSigner(token: string) {
  const signer = getSigner();
  return new ethers.Contract(token, ERC20_ABI, signer);
}

// ---- Çoklu ürün: ETH --------------------------------------------------------
/**
 * Birden fazla ürün için ETH cinsinden fiyat teklifi alır
 * Her ürünün birim fiyatını alıp miktarıyla çarparak toplam maliyeti hesaplar
 * {string} restaurant - Restoran wallet adresi
 *  {string[]} names - Ürün isimleri dizisi
 * {number[]} qtys - Her ürün için miktar dizisi
 *  {Promise<{per: BigNumber[], total: BigNumber}>} Ürün başına ve toplam maliyet
 */
export async function quoteManyETH(restaurant: string, names: string[], qtys: number[]) {
  const sepet = sepetWithSigner();
  const zero = ethers.constants.AddressZero;

  // Her ürünün anlık birim bedelini al → expectedWeiPerItem (qty zaten dahil)
  const per = await Promise.all(
    names.map(async (name, i) => {
      const [unitWei] = await sepet.getRequiredPaymentMany(restaurant, [name], [qtys[i]], zero);
      return unitWei; // qty zaten getRequiredPaymentMany içinde hesaplanmış
    })
  );

  const [total] = await sepet.getRequiredPaymentMany(restaurant, names, qtys, zero);
  return { per, total };
}
/**
 * Birden fazla ürün için ETH ile ödeme yaparak sipariş oluşturur
 *  {string} restaurant - Restoran wallet adresi
 *  {string[]} names - Ürün isimleri dizisi
 *  {number[]} qtys - Her ürün için miktar dizisi
 *  {Promise<TransactionReceipt>} Transaction receipt'i
 */
export async function checkoutManyETH(restaurant: string, names: string[], qtys: number[]) {
  const sepet = sepetWithSigner();
  const { total } = await quoteManyETH(restaurant, names, qtys);

  // Normal tutar gönder - kontrat MetaMask görünürlüğünü halleder

  const tx = await sepet.createOrderETHDynamicMany(restaurant, names, qtys, { value: total });
  return tx.wait();
}

// ---- Çoklu ürün: TOKEN (ör. USDC/FOOD) -------------------------------------
/**
 * Birden fazla ürün için token cinsinden fiyat teklifi alır
 * {string} restaurant - Restoran wallet adresi
 *  {string[]} names - Ürün isimleri dizisi
 * {number[]} qtys - Her ürün için miktar dizisi
 *  {string} token - Ödeme yapılacak token kontrat adresi
 *  {Promise<{per: BigNumber[], total: BigNumber}>} Ürün başına ve toplam maliyet
 */
export async function quoteManyToken(
  restaurant: string,
  names: string[],
  qtys: number[],
  token: string
) {
  const sepet = sepetWithSigner();
// Her ürün için token cinsinden birim fiyatı al (qty zaten dahil)
  const per = await Promise.all(
    names.map(async (name, i) => {
      const [unitAmt] = await sepet.getRequiredPaymentMany(restaurant, [name], [qtys[i]], token);
      return unitAmt; // qty zaten getRequiredPaymentMany içinde hesaplanmış
    })
  );
 // Tüm ürünler için toplam token miktarını al
  const [total] = await sepet.getRequiredPaymentMany(restaurant, names, qtys, token);
  return { per, total };
}

export async function checkoutManyToken(
  restaurant: string,
  names: string[],
  qtys: number[],
  token: string
) {
  const sepet = sepetWithSigner();
  const erc20 = erc20WithSigner(token);

  const { total } = await quoteManyToken(restaurant, names, qtys, token);

  // Avoid unnecessary approvals; only authorize when allowance is insufficient.
  const signer = getSigner();
  const owner = await signer.getAddress();
  const allowance = await erc20.allowance(owner, ESCROW_ADDRESS);
  if (allowance.lt(total)) {
    const tx1 = await erc20.approve(ESCROW_ADDRESS, total);
    const approvalReceipt = await tx1.wait();
    if (approvalReceipt.status === 0) throw new Error('FOOD token approve failed');
  }



  // YENİ: Token miktarını da gönder
  const tx2 = await sepet.createOrderTokenDynamicMany(restaurant, names, qtys, token, total);
  return tx2.wait();
}

// ----  Tek ürün akışı  ---------------

/**
 * Tek ürün için ETH ile ödeme yaparak sipariş oluşturur
 * Eğer miktar 1'den fazla ise çoklu ürün fonksiyonuna yönlendirir
 * {string} restaurant - Restoran wallet adresi
 *  {string} name - Ürün ismi
 *  {number} qty - Ürün miktarı (varsayılan: 1)
 *  {Promise<TransactionReceipt>} Transaction receipt'i
 */

export async function checkoutOneETH(restaurant: string, name: string, qty = 1) {
  // Tek ürün için de many fonksiyonunu kullan
  return checkoutManyETH(restaurant, [name], [qty]);
}

/**
 * Tek ürün için token ile ödeme yaparak sipariş oluşturur
 * {string} restaurant - Restoran wallet adresi
 *  {string} name - Ürün ismi
 *  {string} token - Ödeme yapılacak token kontrat adresi
 *  {number} qty - Ürün miktarı (varsayılan: 1)
 *  {Promise<TransactionReceipt>} Transaction receipt'i
 */
export async function checkoutOneToken(
  restaurant: string,
  name: string,
  token: string,
  qty = 1
) {
  // Tek ürün için de many fonksiyonunu kullan
  return checkoutManyToken(restaurant, [name], [qty], token);
}
