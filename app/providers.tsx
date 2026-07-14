'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { sepolia } from 'wagmi/chains';

export const hacashEVM = {
  ...sepolia,
  name: 'Hacash EVM (Testnet)',
} as const;

// Custom config: injected browser wallet only → zero WalletConnect cloud traffic
const config = createConfig({
  chains: [hacashEVM],
  transports: {
    [hacashEVM.id]: http(),
  },
  connectors: [injected()],
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#9333ea', 
          accentColorForeground: 'white',
          borderRadius: 'medium',
          fontStack: 'system',
          overlayBlur: 'small',
        })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
