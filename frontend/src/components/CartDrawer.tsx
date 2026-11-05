import React, { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import CheckoutModal from './CheckoutModal';
import { ADDRS } from '../lib/addresses';
import { useToast } from './ToastProvider';

const CartDrawer: React.FC<{open:boolean;onClose:()=>void;restaurantAddr:string|null}> = ({open,onClose,restaurantAddr}) => {
  const ref=useRef<HTMLDialogElement>(null);
  const {lines,inc,dec,remove,clear,totalUSD}=useCart();
  const [checkout,setCheckout]=useState(false);
  const {showToast}=useToast();
  const count=lines.reduce((sum,line)=>sum+line.qty,0);
  useEffect(()=>{const dialog=ref.current;if(!dialog)return;if(open&&!dialog.open)dialog.showModal();if(!open&&dialog.open)dialog.close();},[open]);
  useEffect(()=>{const dialog=ref.current;if(!dialog)return;dialog.addEventListener('close',onClose);return()=>dialog.removeEventListener('close',onClose);},[onClose]);
  return <>
    <dialog ref={ref} className="nx-cart-dialog" aria-labelledby="cart-title" onClick={event=>{if(event.target===ref.current&&!checkout)onClose();}}>
      <div className="nx-drawer-inner">
        <div className="nx-drawer-heading"><div><div className="nx-eyebrow nx-orange">SEPETİN</div><h2 id="cart-title">Seçtiklerin <span className="nx-muted-count">({count})</span></h2></div><button className="nx-icon-button" onClick={onClose} aria-label="Sepeti kapat">✕</button></div>
        <div className="nx-drawer-content">{!lines.length?<div className="nx-cart-empty"><div className="nx-cart-empty-art" aria-hidden="true">🛍️</div><h3>Sepetin şimdilik boş</h3><p>Canının çektiği lezzetleri ekle, burada buluşalım.</p><button className="nx-button nx-button-primary" onClick={onClose}>Yemekleri keşfet</button></div>:
          <ul className="nx-cart-list">{lines.map(line=><li key={line.restaurantId+':'+line.item.id} className="nx-cart-line">
            <div className="nx-cart-line-icon" aria-hidden="true">✦</div><div className="nx-cart-line-detail"><h3>{line.item.name}</h3><span>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(line.item.priceUSD)} / adet</span><div className="nx-quantity-control"><button aria-label={line.item.name+' azalt'} onClick={()=>dec(line.item.id)}>−</button><output aria-live="polite">{line.qty}</output><button aria-label={line.item.name+' artır'} onClick={()=>inc(line.item.id)}>+</button></div></div><div className="nx-cart-line-price"><strong>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(line.qty*line.item.priceUSD)}</strong><button className="nx-remove-button" onClick={()=>remove(line.item.id)} aria-label={line.item.name+' sepetten çıkar'}>Sil</button></div>
          </li>)}</ul>}</div>
        {lines.length>0&&<div className="nx-drawer-footer"><div className="nx-subtotal"><span>Ara toplam</span><strong>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(totalUSD)}</strong></div><p className="nx-checkout-note">ℹ Nihai kripto tutarı ve ağ ücreti cüzdan onayında doğrulanır.</p>
          {!restaurantAddr&&<p role="alert" className="nx-checkout-warning">Ödeme kapalı: doğrulanmış on-chain restoran cüzdanı bulunamadı veya demo kataloğu kullanılıyor.</p>}
          <button className="nx-button nx-button-primary nx-checkout-action" disabled={!restaurantAddr} onClick={()=>setCheckout(true)}>Ödemeye geç <span aria-hidden="true">↗</span></button><button className="nx-clear-button" onClick={()=>{if(window.confirm('Sepetteki tüm ürünleri silmek istiyor musun?'))clear();}}>Sepeti temizle</button>
        </div>}
      </div>
    </dialog>
    {checkout&&restaurantAddr&&<CheckoutModal restaurantAddress={restaurantAddr} items={lines.map(line=>({name:line.item.name,qty:line.qty}))} totalUSD={totalUSD} tokenAddress={ADDRS.FOOD} tokenSymbol="FOOD" onClose={()=>setCheckout(false)} onSuccess={hash=>{clear();setCheckout(false);onClose();showToast('Sipariş blockchain üzerinde onaylandı.'+(hash?' Tx: '+hash.slice(0,10)+'…':''),'success',6000);}}/>}
  </>;
};
export default CartDrawer;
