import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useNetwork } from 'wagmi';

type Props = { onHome: () => void; onRestaurantPanel: () => void; onCartClick: () => void; cartCount: number; isPanel: boolean };

const Header: React.FC<Props> = ({ onHome, onRestaurantPanel, onCartClick, cartCount, isPanel }) => {
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  return <header className="nx-header">
    <div className="nx-shell nx-header-inner">
      <button type="button" className="nx-brand-button" onClick={onHome} aria-label="YemekSepeti ana sayfa">
        <span className="nx-brand-mark" aria-hidden="true">✳</span><span className="nx-brand-text">yemeksepeti<span className="nx-brand-dot">.</span><small>dapp</small></span>
      </button>
      <nav className="nx-header-nav" aria-label="Ana menü">
        <button type="button" className={!isPanel ? 'nx-nav-link active' : 'nx-nav-link'} onClick={onHome}>Restoranlar</button>
        <button type="button" className={isPanel ? 'nx-nav-link active' : 'nx-nav-link'} onClick={onRestaurantPanel}>Restoran paneli</button>
      </nav>
      <div className="nx-header-actions">
        {isConnected && <span className={'nx-network-badge ' + (chain?.id === 31337 ? 'connected' : 'warning')} title={chain?.name ?? 'Ağ bilinmiyor'}><span className="nx-network-dot"/><span className="nx-network-label">{chain?.id === 31337 ? 'Localhost' : (chain?.name ?? 'Ağ seç')}</span></span>}
        <div className="nx-wallet"><ConnectButton chainStatus="icon" showBalance={false} accountStatus={{smallScreen: 'avatar',largeScreen: 'full'}} /></div>
        <button type="button" className="nx-cart-trigger" onClick={onCartClick} aria-label={'Sepeti aç, ' + cartCount + ' ürün'}><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 4h2l2.3 11.1a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg><span className="nx-cart-label">Sepetim</span>{cartCount > 0 && <span className="nx-cart-count">{cartCount}</span>}</button>
      </div>
    </div>
  </header>;
};
export default Header;
