import * as React from 'react';
import {Main as Environment} from 'foundry';
// @ts-expect-error missing-declaration
import * as ffjavascript from 'ffjavascript';

import mainWitnessCalculator from '../public/Main_witness_calculator';
import {ethers} from 'ethers';
import {ConnectButton} from '@rainbow-me/rainbowkit';
import {useAccount, useProvider, useSigner} from "wagmi";

const {
  contractAddress,
  abi,
  deployEtherFromFaucet,
} = Environment;

export default function Main(): JSX.Element {

  const {isConnected} = useAccount();
  const provider = useProvider();
  const {data: signer} = useSigner();

  const onAttemptVerify = React.useCallback(() => void (async () => {

    if (!signer) throw new Error(`Expected signer, found "${String(signer)}".`);

    const signerAddress = await signer.getAddress();

    // Give the wallet a little ether from the master wallet for the transaction.
    await deployEtherFromFaucet({to: signerAddress, provider});

    const contract = new ethers.Contract(contractAddress, abi, signer);
    const currentSignerBalance = ethers.utils.formatEther(await provider.getBalance(signerAddress));

    console.log({currentSignerBalance});

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

    // @ts-ignore
    const {unstringifyBigInts} = ffjavascript.utils;
    // @ts-ignore
    const isValidLocal = await snarkjs.groth16.verify(verificationKey, publicSignals, proof);
    console.log({isValidLocal});

    // https://gist.github.com/chnejohnson/c6d76ef15c108464539de535d48a7f9b
    // @ts-ignore
    const calldata = await snarkjs.groth16.exportSolidityCallData(
      unstringifyBigInts(proof),
      unstringifyBigInts(publicSignals)
    );

    const isValidEthereum = await contract.verifyProof(...JSON.parse(`[${calldata}]`));
    console.log({isValidEthereum});
  })(), [provider, signer]);

  if (!isConnected) return <ConnectButton />;

  return (
    <div>
      connected
      <button onClick={onAttemptVerify}>
        run verifiable computation
      </button>
    </div>
  );
}
