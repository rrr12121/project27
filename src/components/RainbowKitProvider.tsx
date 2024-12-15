import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider as RKProvider,
  Theme,
  darkTheme,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, bsc } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { Chain } from 'wagmi';

// WalletConnect v2 project ID
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3219df4fa4c87ae9e150db07db80d1a4";
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "OTqeM_zvxupsG5b5HD-WztCjxggbnTiL";

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, bsc],
  [
    // Alchemy provider for Ethereum mainnet
    alchemyProvider({ apiKey: alchemyKey }),
    // Custom RPC provider for BSC
    jsonRpcProvider({
      rpc: (chain: Chain) => {
        if (chain.id === bsc.id) {
          return {
            http: 'https://bsc-dataseed1.binance.org',
            webSocket: 'wss://bsc-ws-node.nariox.org:443'
          };
        }
        return null;
      },
    }),
    // Fallback to public provider
    publicProvider()
  ],
  {
    // Add pollingInterval for better real-time updates
    pollingInterval: 4_000,
    // Add retry configuration
    targetQuorum: 1,
    stallTimeout: 5_000,
    // Removed unsupported webSocketRetry config
  }
);

const { connectors } = getDefaultWallets({
  appName: 'Cat0 Crypto Casino',
  projectId,
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
  // Updated logger configuration
  logger: {
    warn: (message: string) => console.warn(message),
  },
});

const customDarkTheme: Theme = {
  ...darkTheme(),
  colors: {
    ...darkTheme().colors,
    accentColor: '#FFD700', // Gold color
    accentColorForeground: '#1A1B1F', // Dark background
    modalBackground: '#1A1B1F',
    modalBorder: '#FFD700',
  },
  radii: {
    ...darkTheme().radii,
    connectButton: '12px',
    menuButton: '12px',
    modal: '16px',
  },
  fonts: {
    ...darkTheme().fonts,
    body: '"Poppins", sans-serif',
  },
  shadows: {
    ...darkTheme().shadows,
    connectButton: '0 0 10px 5px rgba(255, 215, 0, 0.3)', // Gold glow
  },
};

interface RainbowKitProviderProps {
  children: React.ReactNode;
}

export const RainbowKitProvider: React.FC<RainbowKitProviderProps> = ({ children }) => {
  return (
    <WagmiConfig client={wagmiClient}>
      <RKProvider 
        chains={chains} 
        initialChain={mainnet}
        theme={customDarkTheme}
        coolMode
        showRecentTransactions={true}
        appInfo={{
          appName: 'Cat0 Crypto Casino',
          learnMoreUrl: 'https://your-project-website.com/about',
        }}
        modalSize="compact"
      >
        {children}
      </RKProvider>
    </WagmiConfig>
  );
};
