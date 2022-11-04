import '@rainbow-me/rainbowkit/styles.css';

import * as React from 'react';
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
// @ts-expect-error missing declarations
import * as snarkjs from 'snarkjs';

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

function Main(): JSX.Element {
  React.useEffect(() => void (async () => {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve({a: 3, b: 11}, "Main.wasm", "circuit_final.zkey");
    console.log('hi');
  })(), []);
  return <ConnectButton />;
}

export default function App() {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Main />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
