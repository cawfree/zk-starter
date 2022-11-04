import * as React from 'react';
import {Main as Environment} from 'anvil';

import mainWitnessCalculator from '../public/Main_witness_calculator';
import {ethers, Wallet} from 'ethers';

const {
  ANVIL_DEFAULT_WALLET_PRIVATE_KEY_DO_NOT_USE_YOU_WILL_GET_REKT,
  rpcUrl,
  contractAddress,
  abi,
} = Environment;

export default function Main(): JSX.Element {

  React.useEffect(() => void (async () => {
    // Don't execute on the Next.js server.
    if (typeof window === 'undefined') return;

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new Wallet(
      ANVIL_DEFAULT_WALLET_PRIVATE_KEY_DO_NOT_USE_YOU_WILL_GET_REKT,
      provider,
    );

    const contract = new ethers.Contract(contractAddress, abi, wallet);
    // TODO: turn this into a module

    const [wasm, verificationKey] = await Promise.all([
      fetch('/Main.wasm').then(e => e.arrayBuffer()),
      fetch('/Main_verification_key.json').then(e => e.json()),
    ]);

    // https://github.com/iden3/snarkjs/issues/126#issuecomment-1022877878
    const witnessCalculator = await mainWitnessCalculator(wasm);

    const witnessBuffer = await witnessCalculator.calculateWTNSBin(
      {a: 3, b: 11},
      0,
    );

    // @ts-ignore
    const { proof, publicSignals } = await snarkjs.groth16.prove('/Main_final.zkey', witnessBuffer);

    const current = await contract.number();
    await contract.increment();
    const next = await contract.number();

    // @ts-ignore
    const isValid = await snarkjs.groth16.verify(verificationKey, publicSignals, proof);

    console.log({isValid, current, next, proof, publicSignals});
  })(), []);

  return <React.Fragment />;
}
