import * as React from 'react';
import {ExampleCircuit} from 'foundry';

import {ethers} from 'ethers';
import {ConnectButton} from '@rainbow-me/rainbowkit';
import {useAccount, useProvider, useSigner} from "wagmi";

const {
  contractAddress,
  abi,
  deployEtherFromFaucet,
  createZeroKnowledgeHelpersAsync,
} = ExampleCircuit;

type Result = {
  readonly successfullyVerifiedLocally: boolean;
  readonly successfullyVerifiedOnChain: boolean;
};

export default function App(): JSX.Element {

  const {isConnected} = useAccount();
  const provider = useProvider();
  const {data: signer} = useSigner();
  const [result, setResult] = React.useState<Result | null>(null);

  const onAttemptVerify = React.useCallback(() => void (async () => {

    if (!signer) throw new Error(`Expected signer, found "${String(signer)}".`);

    const signerAddress = await signer.getAddress();

    // Give the wallet a little ether from the master wallet for the transaction.
    await deployEtherFromFaucet({to: signerAddress, provider});

    const contract = new ethers.Contract(contractAddress, abi, signer);
    const currentSignerBalance = ethers.utils.formatEther(await provider.getBalance(signerAddress));

    console.log({currentSignerBalance});

    const {createProofAndPublicSignals} = await createZeroKnowledgeHelpersAsync();
    const {checkIsProofValid, exportSolidityCallData} = await createProofAndPublicSignals({
      inputSignals: {a: 3, b: 11},
    });

    const isValidLocal = await checkIsProofValid();
    console.log({isValidLocal});

    const isValidEthereum = await contract.verifyProof(...(await exportSolidityCallData()));

    console.log({isValidEthereum});

    setResult({
      successfullyVerifiedLocally: isValidLocal,
      successfullyVerifiedOnChain: isValidEthereum,
    });
  })(), [provider, signer, setResult]);

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
            Although the security and resilience of public blockchains are indeed thanks to their open nature, humans nonetheless have a fundamental right to privacy. Similarly, increasing competition for block space and the subsequent rise in gas fees demand that we move more computation and storage off-chain, without compromising on our stringent operational expectations.
          </p>
          <p>
            A zero knowledge proof is a goldilocks paradigm, an inexplicable feature of the mathematics of the universe which helps us all operate privately, securely, trustlessly, minimally, with integrity; and above all else, in plain sight.
          </p>
          {isConnected && (
            <button
              onClick={onAttemptVerify}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
              Verify Proof 🪄
            </button>
          )}
          {!!result && (
            <>
              <p>
                Verified within browser: {result.successfullyVerifiedLocally ? '✅' : '❌'}
              </p>
              <p>
                Verified on chain: {result.successfullyVerifiedOnChain ? '✅' : '❌'}
              </p>
            </>
          )}
        </article>
      </div>
    </div>
  );
}
