import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

import * as React from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import {ExampleCircuit} from 'foundry';

const {rpcUrl} = ExampleCircuit;

const { chains, provider } = configureChains(
  [chain.localhost],
  [
    jsonRpcProvider({
      rpc: () => ({http: rpcUrl}),
    })
  ]
);

const {connectors} = getDefaultWallets({
  appName: 'zk-starter',
  chains
});

const wagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider
})

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} coolMode>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}