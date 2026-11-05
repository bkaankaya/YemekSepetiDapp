import React,{useEffect,useRef,useState} from 'react';
import { ethers } from 'ethers';
import {checkoutManyETH,checkoutManyToken} from '../lib/api';
import {getClients,ensureCustomerRegistered} from '../lib/chain';
type Choice='ETH'|'TOKEN';
type Props={restaurantAddress:string;items:{name:string;qty:number}[];totalUSD:number;tokenAddress?:string;tokenSymbol?:string;onClose:()=>void;onSuccess?:(hash?:string)=>void;onError?:(err:unknown)=>void};
const CheckoutModal:React.FC<Props>=({restaurantAddress,items,totalUSD,tokenAddress,tokenSymbol='FOOD',onClose,onSuccess,onError})=>{
 const ref=useRef<HTMLDialogElement>(null);
 const [method,setMethod]=useState<Choice>('ETH');
 const [phase,setPhase]=useState<'idle'|'wallet'|'confirming'>('idle');
 const [error,setError]=useState<string|null>(null);
 const busy=phase!=='idle';
 useEffect(()=>{const dialog=ref.current;if(dialog&&!dialog.open)dialog.showModal();return()=>{if(dialog?.open)dialog.close();};},[]);
 const submit=async()=>{
  if(busy||!items.length)return;
  setError(null);setPhase('wallet');
  try{
   if(!ethers.utils.isAddress(restaurantAddress))throw new Error('Geçersiz restoran cüzdan adresi.');
   const {yem,signer,provider}=await getClients();
   const code=await provider.getCode(yem.address);
   if(code==='0x')throw new Error('Bu ağda YemekSepeti kontratı bulunamadı. Deploy adreslerini kontrol et.');
   const registered=await yem.restaurants(restaurantAddress);
   if(String(registered.walletAddress ?? registered[0]).toLowerCase()===ethers.constants.AddressZero.toLowerCase()) {
     throw new Error('Bu restoran seçili kontratta kayıtlı değil. Ödeme gönderilmedi.');
   }
   if(method==='TOKEN' && tokenAddress && (await provider.getCode(tokenAddress))==='0x') {
     throw new Error('FOOD token kontratı bu ağda bulunamadı.');
   }
   setPhase('confirming');
   // First purchase may require an additional explicit wallet confirmation.
   await ensureCustomerRegistered(yem,signer);
   const names=items.map(item=>item.name),qtys=items.map(item=>item.qty);
   if(!names.every(Boolean)||!qtys.every(q=>Number.isInteger(q)&&q>0))throw new Error('Sepet miktarları geçersiz.');
   const receipt:any=method==='ETH'?await checkoutManyETH(restaurantAddress,names,qtys):
     tokenAddress&&ethers.utils.isAddress(tokenAddress)?await checkoutManyToken(restaurantAddress,names,qtys,tokenAddress):
     (()=>{throw new Error('Geçersiz FOOD token adresi.');})();
   if(receipt?.status===0)throw new Error('Blockchain işlemi başarısız oldu.');
   onSuccess?.(receipt?.transactionHash??receipt?.hash);
  }catch(err:unknown){
   const e=err as {code?:number;message?:string;reason?:string};
   let msg=e?.reason??e?.message??'İşlem tamamlanamadı.';
   if(e?.code===4001||/user rejected|user denied/i.test(msg))msg='Cüzdan onayı reddedildi. Sipariş oluşturulmadı.';
   else if(/31337|wrong network|yanlış ağ|localhost/i.test(msg))msg='Yanlış ağ: cüzdanından Localhost (31337) ağını seçip yeniden dene.';
   else if(/insufficient funds/i.test(msg))msg='Cüzdanda yeterli bakiye veya gas ücreti yok.';
   else if(/token not accepted/i.test(msg))msg='Bu restoran FOOD token kabul etmiyor.';
   else if(/token price missing/i.test(msg))msg='Token fiyatı Oracle üzerinde tanımlı değil.';
   else if(/price moved/i.test(msg))msg='Fiyat değişti. Lütfen tutarı kontrol et.';
   setError(msg);onError?.(err);
  }finally{setPhase('idle');}
 };
 return <dialog ref={ref} className="nx-checkout-dialog" aria-labelledby="nx-checkout-title" onCancel={event=>{if(busy)event.preventDefault();else onClose();}} onClick={event=>{if(event.target===ref.current&&!busy)onClose();}}>
  <div className="nx-checkout-surface"><div className="nx-checkout-header"><div><div className="nx-eyebrow nx-orange">GÜVENLİ ÖDEME</div><h2 id="nx-checkout-title">Siparişi tamamla</h2></div><button className="nx-icon-button" disabled={busy} onClick={onClose} aria-label="Ödemeyi kapat">✕</button></div>
  <div className="nx-checkout-body"><div className="nx-checkout-summary"><span>Sepet toplamı (USD)</span><strong>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(totalUSD)}</strong><small>Kesin ödeme tutarı akıllı kontrat tarafından hesaplanır.</small></div>
  <div className="nx-field-heading">Nasıl ödemek istersin?</div><div className="nx-payment-options" role="radiogroup" aria-label="Ödeme yöntemi">
   <label className={'nx-payment-option'+(method==='ETH'?' selected':'')}><input type="radio" name="payment" checked={method==='ETH'} onChange={()=>setMethod('ETH')} disabled={busy}/><span className="nx-payment-symbol">◆</span><span><strong>Ethereum (ETH)</strong><small>Akıllı kontrat üzerinden</small></span><span className="nx-radio-indicator"/></label>
   <label className={'nx-payment-option'+(method==='TOKEN'?' selected':'')}><input type="radio" name="payment" checked={method==='TOKEN'} onChange={()=>setMethod('TOKEN')} disabled={busy}/><span className="nx-payment-symbol token">◈</span><span><strong>{tokenSymbol} Token</strong><small>ERC-20 ile ödeme</small></span><span className="nx-radio-indicator"/></label>
  </div><div className="nx-network-information"><span>◉</span><span>Şu anda yalnızca <strong>Localhost / Hardhat 31337</strong> ağında ödeme desteklenir. RainbowKit üzerinden ağını seçmelisin.</span></div>{method==='TOKEN'&&<div className="nx-network-information"><span>ℹ</span><span>FOOD token işlemi harcama izni (approve) ve sipariş için iki cüzdan onayı gerektirebilir.</span></div>}
  <div className="nx-network-information"><span>ℹ</span><span>İlk siparişte müşteri kaydı için bir defalık ek cüzdan onayı istenebilir.</span></div>
  {busy&&<p role="status" className="nx-progress-info">{phase==='wallet'?'Cüzdan ve ağ doğrulanıyor…':'Cüzdan onayı ve blockchain kesinleşmesi bekleniyor…'}</p>}
  {error&&<div role="alert" className="nx-checkout-error">{error}</div>}</div>
  <div className="nx-checkout-footer"><button className="nx-button nx-button-secondary" onClick={onClose} disabled={busy}>Vazgeç</button><button className="nx-button nx-button-primary" onClick={()=>void submit()} disabled={busy||!items.length}>{busy?'İşlem sürüyor…':'Cüzdan ile onayla ↗'}</button></div></div>
 </dialog>;
};
export default CheckoutModal;
