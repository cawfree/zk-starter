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

  //The goal of this project is to help accelerate developers towards the utilization of private, verifiable computation in their own decentralized applications.
  // Public blockchains are starting to enable co-ordination games on scales never-before-seen in history.
  return (
    <div className="py-4 px-4">
      <ConnectButton />
      <div className="min-h-screen min-w-screen py-4 px-4">
        <article className="container prose lg:prose-xl">
          <h1>Welcome to zk-starter! 👋</h1>
          <p>
            We can use adversarial incentivised networks like <a href="https://ethereum.org">Ethereum</a> to perform computation with very strong guarantees of correctness, immutability and verifiability.
          </p>
          <p>
            Although the security and resilience of public blockchains are indeed thanks to their open nature, humans nonetheless have a fundamental right to privacy, and decentralized organizations must be capable of authentication of users and data.
          </p>
          <p>
            A zero knowledge proof is a goldilocks paradigm, an inexplicable feature of the mathematics of the universe; it helps us all operate privately, securely, trustlessly, with integrity; all via publicly-verifiable information channels.
          </p>
          <p>
            The ability to securely and indisputably demonstrate access to information without revealing that information is magical.
          </p>
          {isConnected && (
            <button
              onClick={onAttemptVerify}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
              Execute Zero Knowledge Proof 🪄
            </button>
          )}
        </article>
      </div>
    </div>

  );
}
