import { ethers, BigNumber } from "ethers";
import { ERC20_MIN, ensureCustomerRegistered, getClients } from "./chain";
import { ESCROW_ADDRESS, ORACLE_ADDRESS, FOOD_ADDRESS } from "./contracts";

export type LineItem = { name: string; priceUSD: number; qty: number };

export async function handleCheckout({
  cart, restaurantAddr, payment
}:{
  cart: LineItem[];
  restaurantAddr: string;
  payment: { kind:"ETH" } | { kind:"TOKEN"; token:string };
}) {
  if (!cart.length) throw new Error("Sepet boş");

  const { signer, yem } = await getClients();
  // Müşteri kaydı yoksa otomatik kaydet
  await ensureCustomerRegistered(yem, signer, "Web Client");
  const me = await signer.getAddress();

  const items: string[] = cart.map(i => i.name);
  const qtys: number[] = cart.map(i => i.qty);

  // Önce token kabul kontrolü yap
  if (payment.kind === "TOKEN") {
    const token = payment.token;
    
    // Her item için token kabul kontrolü
    for (let i = 0; i < items.length; i++) {
      const isAccepted = await yem.isTokenAccepted(restaurantAddr, items[i], token);
      if (!isAccepted) {
        throw new Error(`${items[i]} için ${token} token'ı kabul edilmiyor`);
      }
    }
  }

  if (payment.kind === "ETH") {
    // ETH ile ödeme - yeni kontrat sadece toplam USD değerini kontrol eder
    // Oracle ETH fiyatını kullanarak slippage kontrolü yapar
    
    // Toplam USD değerini hesapla
    let totalUSDWei = ethers.constants.Zero;
    for (let i = 0; i < cart.length; i++) {
      const priceData = await yem.getMenuPriceQuote(restaurantAddr, items[i]);
      const itemUSDWei = priceData.priceUSD.mul(qtys[i]);
      totalUSDWei = totalUSDWei.add(itemUSDWei);
    }

    // Oracle'dan ETH fiyatını al ve gerekli ETH miktarını hesapla
    const oracle = new ethers.Contract(ORACLE_ADDRESS, [
      "function currentEthPriceE18() view returns (uint256)"
    ], signer);
    
    const ethPriceE18 = await oracle.currentEthPriceE18();
    // totalUSDWei zaten 18 decimal, ETH fiyatı 18 decimal
    // Gerekli ETH = (totalUSDWei * 1e18) / ethPriceE18
    const requiredWei = totalUSDWei.mul(ethers.utils.parseEther("1")).div(ethPriceE18);

    const tx = await yem.createOrderETHDynamicMany(
      restaurantAddr,
      items,
      qtys,
      { value: requiredWei }
    );
    return await tx.wait();
    
  } else {
    const token = payment.token;
    const erc20 = new ethers.Contract(token, ERC20_MIN, signer);

    // Token ile ödeme - Oracle token fiyatını kullanarak gerekli token miktarını hesapla
    let totalUSDWei = ethers.constants.Zero;
    for (let i = 0; i < cart.length; i++) {
      const priceData = await yem.getMenuPriceQuote(restaurantAddr, items[i]);
      const itemUSDWei = priceData.priceUSD.mul(qtys[i]);
      totalUSDWei = totalUSDWei.add(itemUSDWei);
    }

    // Oracle'dan token fiyatını al
    const oracle = new ethers.Contract(ORACLE_ADDRESS, [
      "function currentTokenPriceE18(address) view returns (uint256)",
      "function convertUsdToToken(uint256, address) view returns (uint256)"
    ], signer);
    
    // USD'yi token miktarına çevir
    const totalUSDInE18 = totalUSDWei.mul(ethers.utils.parseEther("1")).div(100); // Cent'ten E18'e
    const requiredTokenAmount = await oracle.convertUsdToToken(totalUSDInE18, token);

    const allowance: BigNumber = await erc20.allowance(me, ESCROW_ADDRESS);
    if (allowance.lt(requiredTokenAmount)) {
      await (await erc20.approve(ESCROW_ADDRESS, requiredTokenAmount)).wait();
    }

    const tx = await yem.createOrderTokenDynamicMany(
      restaurantAddr, items, qtys, token, requiredTokenAmount
    );
    return await tx.wait();
  }
}
