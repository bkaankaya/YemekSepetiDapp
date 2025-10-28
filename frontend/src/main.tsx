import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig, WagmiConfig, type Chain } from 'wagmi'
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from './lib/graphql'

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
  [hardhat, sepolia, mainnet, polygon, optimism, arbitrum, base],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === 31337) {
          return { http: 'http://127.0.0.1:8545' }
        }
        if (chain.id === 11155111) { // Sepolia
          return { http: 'https://ethereum-sepolia-rpc.publicnode.com' }
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
  projectId: 'YEMEKSEPETI_DAPP_2024_LOCAL', // Geçerli project ID
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
          <ApolloProvider client={apolloClient}>
            <App />
          </ApolloProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  </React.StrictMode>,
)
