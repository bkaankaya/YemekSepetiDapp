import React, { useMemo, useState } from "react";
import { checkoutManyETH, checkoutManyToken } from "../lib/api";
import { ADDRS } from "../lib/addresses";
import { addFoodTokenToMetaMask } from "../lib/metamask";
import { getClients } from "../lib/chain";

type Choice = { method: "ETH" | "TOKEN" };
type CartItem = { name: string; qty: number; price: number };

const CheckoutModal: React.FC<{
  restaurantAddress: `0x${string}`;
  items: CartItem[];                // [{ name, qty }, ...]
  totalUSD: number;
  approxETH: number;
  // ERC20 yolunda kullanılacak token bilgisi:
  tokenAddress?: `0x${string}`;     // verilmezse ADDRS.PAY_TOKEN || ADDRS.FOOD denenir
  tokenSymbol?: string;             // ör. "FOOD" (varsayılan "TOKEN")
  onClose: () => void;
  onConfirm?: (choice: Choice) => void;
  onSuccess?: (txHash?: string) => void;
  onError?: (err: unknown) => void;
}> = ({
  restaurantAddress,
  items,
  totalUSD,
  approxETH,
  tokenAddress,
  tokenSymbol = "TOKEN",
  onClose,
  onConfirm,
  onSuccess,
  onError,
}) => {
  const [method, setMethod] = useState<Choice["method"]>("ETH");
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { names, qtys } = useMemo(
    () => ({ names: items.map(i => i.name), qtys: items.map(i => i.qty) }),
    [items]
  );



  const handleConfirm = async () => {
    if (!names.length) return;
    setSubmitting(true);
    setErrMsg(null);

    try {
      // Signer & ağ doğrulaması (MetaMask hesap isteği + 31337 kontrolü)
      try {
        await getClients();
      } catch (e: any) {
        setErrMsg(e?.message || "Cüzdan bağlantısı başarısız. Lütfen Localhost(31337) ağına bağlanın.");
        setSubmitting(false);
        return;
      }

      let tx: any;

      if (method === "ETH") {
        tx = await checkoutManyETH(restaurantAddress, names, qtys);
      } else {
        // TOKEN: adresi prop -> ADDRS.PAY_TOKEN -> ADDRS.FOOD sırasıyla dener
        const addr =
          (tokenAddress ||
            (ADDRS as any).PAY_TOKEN ||
            (ADDRS as any).FOOD) as `0x${string}` | undefined;

        if (!addr) {
          setErrMsg("Token adresi tanımlı değil (tokenAddress / ADDRS.PAY_TOKEN / ADDRS.FOOD).");
          setSubmitting(false);
          return;
        }
        
        // Token'ı otomatik ekle (MetaMask'te görünürlük için)
        try {
          await addFoodTokenToMetaMask();
        } catch (error) {
          console.log("Token ekleme başarısız, devam ediliyor...");
        }
        
        // Token ödeme öncesi debug bilgisi
        console.log("🔍 Token ödeme debug:");
        console.log("Restaurant:", restaurantAddress);
        console.log("Items:", names);
        console.log("Quantities:", qtys);
        console.log("Token address:", addr);
        console.log("Oracle address:", ADDRS.ORACLE);
        
        try {
          tx = await checkoutManyToken(restaurantAddress, names, qtys, addr);
        } catch (error: any) {
          console.error("❌ Token ödeme hatası:", error);
          
          // Hata detaylarını göster
          if (error.message.includes("token price missing")) {
            setErrMsg("Token fiyatı Oracle'da ayarlanmamış. Lütfen yöneticiye başvurun.");
          } else if (error.message.includes("token not accepted")) {
            setErrMsg("Bu restoran FOOD token ile ödeme kabul etmiyor.");
          } else if (error.message.includes("insufficient allowance")) {
            setErrMsg("Token harcama yetkisi yetersiz. Lütfen approve işlemini yapın.");
          } else {
            setErrMsg("Token ödeme hatası: " + (error.message || "Bilinmeyen hata"));
          }
          
          setSubmitting(false);
          return;
        }
      }

      if (tx?.wait) {
        const r = await tx.wait();
        onSuccess?.(r?.transactionHash);
      } else {
        onSuccess?.(tx?.hash);
      }

      onConfirm?.({ method });
      onClose();
    } catch (e: any) {
      let errorMsg = "İşlem gönderilemedi.";
      
      if (e?.message?.includes("token price missing")) {
        errorMsg = "Token fiyatı Oracle'da ayarlanmamış. Lütfen yöneticiye başvurun.";
      } else if (e?.message?.includes("token not accepted")) {
        errorMsg = "Bu ürün için seçilen token kabul edilmiyor.";
      } else if (e?.message?.includes("insufficient allowance")) {
        errorMsg = "Token harcama yetkisi yetersiz.";
      } else if (e?.message?.includes("price moved")) {
        errorMsg = "Fiyat değişti, lütfen tekrar deneyin.";
      } else if (e?.shortMessage) {
        errorMsg = e.shortMessage;
      } else if (e?.message) {
        errorMsg = e.message;
      }
      
      setErrMsg(errorMsg);
      onError?.(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="checkout-modal">
        <div className="checkout-header">
          <h3 className="checkout-title">💳 Ödeme</h3>
          <button className="checkout-close-btn" onClick={onClose} disabled={submitting}>
            ✕
          </button>
        </div>

        <div className="checkout-body">
          <div className="checkout-summary">
            <div className="checkout-total">
              <span className="total-label">Toplam Tutar</span>
              <span className="total-amount">${totalUSD.toFixed(2)}</span>
              {method === "ETH" && (
                <span className="total-eth">~{approxETH.toFixed(4)} ETH</span>
              )}
            </div>
          </div>

          <div className="payment-methods">
            <h4 className="payment-methods-title">Ödeme Yöntemi Seçin</h4>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  checked={method === "ETH"}
                  onChange={() => setMethod("ETH")}
                  disabled={submitting}
                  className="payment-radio"
                />
                <div className="payment-option-content">
                  <div className="payment-option-icon">🔷</div>
                  <div className="payment-option-text">
                    <span className="payment-option-name">ETH ile Ödeme</span>
                    <span className="payment-option-desc">Ethereum ağı üzerinden</span>
                  </div>
                </div>
              </label>
              
              <label className="payment-option">
                <input
                  type="radio"
                  checked={method === "TOKEN"}
                  onChange={() => setMethod("TOKEN")}
                  disabled={submitting}
                  className="payment-radio"
                />
                <div className="payment-option-content">
                  <div className="payment-option-icon">🪙</div>
                  <div className="payment-option-text">
                    <span className="payment-option-name">{tokenSymbol} (ERC20) ile Ödeme</span>
                    <span className="payment-option-desc">Token tabanlı ödeme</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {errMsg && (
            <div className="checkout-error">
              <div className="error-icon">⚠️</div>
              <div className="error-message">{errMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="checkout-success">
              <div className="success-icon">✅</div>
              <div className="success-message">{successMsg}</div>
            </div>
          )}
        </div>

        <div className="checkout-footer">
          <button 
            className="btn btn-outline checkout-cancel-btn" 
            onClick={onClose} 
            disabled={submitting}
          >
            İptal
          </button>
          <button
            className="btn btn-primary checkout-confirm-btn"
            onClick={handleConfirm}
            disabled={submitting || names.length === 0}
          >
            {submitting ? (
              <>
                <span className="loading-spinner"></span>
                İşlem Gönderiliyor...
              </>
            ) : (
              <>
                <span className="confirm-icon">✓</span>
                Onayla
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
