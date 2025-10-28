import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';

const Header: React.FC<{ onCartClick: () => void; cartCount: number }> = ({ onCartClick, cartCount }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <div className="brand">
            <span className="brand-icon">🍽️</span>
            <span>YemekSepeti</span>
          </div>
        </div>
        
        <div className="header-right">
          <button className="cart-btn" onClick={onCartClick}>
            🛒 Sepet <span className="cart-badge">{cartCount}</span>
          </button>
          <ConnectButton 
            chainStatus="icon"
            showBalance={false}
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full',
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
