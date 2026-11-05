import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig, WagmiConfig, type Chain } from 'wagmi'

import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Hardhat yerel ağı (31337)
const hardhat: Chain = {
  id: 31337,
  name: 'Hardhat',
  network: 'hardhat',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
}

const { chains, publicClient } = configureChains(
  [hardhat],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === 31337) {
          return { http: 'http://127.0.0.1:8545' }
        }
          return null
      },
    }),
    publicProvider(),
  ]
)

// Sadece MetaMask ve diğer cüzdanlar, WalletConnect yok
const { connectors } = getDefaultWallets({
  appName: 'YemekSepeti DApp',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YEMEKSEPETI_DAPP_2024_LOCAL', // Replace with your own valid project ID if WalletConnect is enabled
  chains
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

// wagmi actions ile kullanılmak üzere config'i export edelim
export const config = wagmiConfig

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  </React.StrictMode>,
)
