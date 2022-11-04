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
  createClient, useProvider,
  WagmiConfig,
} from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

import mainWitnessCalculator from '../public/Main_witness_calculator';

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

  const provider = useProvider();

  React.useEffect(() => void (async () => {
    // https://github.com/iden3/snarkjs/issues/126#issuecomment-1022877878
    const x = await mainWitnessCalculator(
      await fetch('/Main.wasm').then(e => e.arrayBuffer())
    );

    const witnessBuffer = (await x.calculateWTNSBin({a: 3, b: 11}, 0));
    // @ts-ignore
    const { proof, publicSignals } = await snarkjs.groth16.prove('/Main_final.zkey', witnessBuffer);

    console.log(proof, publicSignals);
  })(), [provider]);

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
