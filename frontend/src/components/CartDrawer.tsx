import React, { useState, useEffect } from "react";
import { useCart } from '../context/CartContext';
import CheckoutModal from "./CheckoutModal";
import { ADDRS } from '../lib/addresses';
import { ethers } from "ethers";
import { useToast } from './ToastProvider';

type Props = {
  open: boolean;
  onClose: () => void;
  ethUsdPrice?: number;
  /** Kontrata kayıtlı restoran cüzdanı (hardhat console'da a1.address) */
  restaurantAddr: string;
};

const CartDrawer: React.FC<Props> = ({ open, onClose, ethUsdPrice = 3200, restaurantAddr }) => {
  const { lines, inc, dec, remove, clear, totalUSD } = useCart();
  const [checkout, setCheckout] = useState(false);
  const [isProcessing] = useState(false);
  const [realEthPrice, setRealEthPrice] = useState<number>(ethUsdPrice);
  const { showToast } = useToast();

  const hasItems = lines.length > 0;
  
  // Oracle'dan gerçek ETH fiyatını al
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const oracle = new ethers.Contract(ADDRS.ORACLE, [
          "function currentEthPriceE18() view returns (uint256)"
        ], provider);
        
        const ethPriceE18 = await oracle.currentEthPriceE18();
        const ethPriceUSD = parseFloat(ethers.utils.formatUnits(ethPriceE18, 18));
        setRealEthPrice(ethPriceUSD);
        
        console.log("🔍 Oracle'dan alınan ETH fiyatı:", ethPriceUSD);
      } catch (error) {
        console.log("Oracle'dan ETH fiyatı alınamadı, varsayılan kullanılıyor:", ethUsdPrice);
        setRealEthPrice(ethUsdPrice);
      }
    };

    if (open && hasItems) {
      fetchEthPrice();
    }
  }, [open, hasItems, ethUsdPrice]);

  const totalETH = totalUSD / realEthPrice;


  return (
    <>
      <aside className={`drawer ${open ? "open" : ""}`}> 
        <div className="drawer-head">
          <h3 className="drawer-title">Sepet</h3>
          <button className="close-btn" onClick={onClose} disabled={isProcessing}>
            Kapat
          </button>
        </div>

        {!hasItems && <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <div>Sepetiniz boş.</div>
        </div>}

        {hasItems && (
          <ul className="cart-list">
            {lines.map((l) => (
              <li key={l.item.id} className="cart-line">
                <div>
                  <div className="line-name">{l.item.name}</div>
                  <div className="line-sub">
                    ${l.item.priceUSD.toFixed(2)} × {l.qty}
                  </div>
                </div>
                <div className="line-actions">
                  <button className="btn btn-sm btn-outline" onClick={() => dec(l.item.id)} disabled={isProcessing}>-</button>
                  <span className="qty">{l.qty}</span>
                  <button className="btn btn-sm btn-outline" onClick={() => inc(l.item.id)} disabled={isProcessing}>+</button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(l.item.id)} disabled={isProcessing}>×</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="totals">
          <div className="totals-summary">
            Toplam: <strong>${totalUSD.toFixed(2)}</strong> (~{totalETH.toFixed(4)} ETH)
          </div>
          <div className="totals-actions">
            <button className="btn btn-outline" onClick={clear} disabled={!hasItems || isProcessing}>
              Temizle
            </button>
            <button className="btn btn-primary" onClick={() => setCheckout(true)} disabled={!hasItems || isProcessing}>
              {isProcessing ? "Ödeniyor..." : "Ödemeye Geç"}
            </button>
          </div>
        </div>
      </aside>

      {checkout && (
        <CheckoutModal
          restaurantAddress={restaurantAddr as `0x${string}`} // kontrattaki restoran cüzdanı
          items={lines.map(l => ({ name: l.item.name, qty: l.qty })) as any}
          totalUSD={totalUSD}
          approxETH={totalETH}
          tokenAddress={ADDRS.FOOD as `0x${string}`}
          tokenSymbol="FOOD"
          onClose={() => setCheckout(false)}
          // Modal zaten işlemi gönderiyor; burada sadece UI akışını yönetelim
          onConfirm={() => setCheckout(false)}
          onSuccess={() => { 
            clear(); 
            showToast("Sipariş oluşturuldu ve ödeme escrow'a yatırıldı.", 'success', 5000);
          }}
        />
      )}
    </>
  );
};

export default CartDrawer;
