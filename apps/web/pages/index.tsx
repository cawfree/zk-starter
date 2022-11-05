import * as React from 'react';
import {Main as Environment} from 'anvil';
// @ts-expect-error missing-declaration
import * as ffjavascript from 'ffjavascript';

import mainWitnessCalculator from '../public/Main_witness_calculator';
import {ethers, Wallet} from 'ethers';

const {
  ANVIL_DEFAULT_WALLET_PRIVATE_KEY_DO_NOT_USE_YOU_WILL_GET_REKT,
  rpcUrl,
  contractAddress,
  abi,
} = Environment;

export default function Main(): JSX.Element {

  const onAttemptVerify = React.useCallback(() => void (async () => {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new Wallet(
      ANVIL_DEFAULT_WALLET_PRIVATE_KEY_DO_NOT_USE_YOU_WILL_GET_REKT,
      provider,
    );

    const contract = new ethers.Contract(contractAddress, abi, wallet);

    const before = await contract.number();
    await contract.increment();
    const after = await contract.number();
    console.log({before, after});

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
  })(), []);

  // eslint-disable-next-line react/no-children-prop
  return <button children="Verify" onClick={onAttemptVerify} />;
}
