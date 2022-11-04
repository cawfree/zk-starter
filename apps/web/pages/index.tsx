import '@rainbow-me/rainbowkit/styles.css';

import {
    ConnectButton,
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

const { chains, provider } = configureChains(
  [chain.localhost],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: 'http://localhost:8545',
      }),
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'zk-starter',
  chains
});

const wagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider
});

export default function Web() {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <ConnectButton />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
