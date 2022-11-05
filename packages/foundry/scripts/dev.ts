import * as child_process from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

import {ethers} from 'ethers';

const ANVIL_DEFAULT_WALLET_PRIVATE_KEY_DO_NOT_USE_YOU_WILL_GET_REKT = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const deployContractsByName = async ({contractNames, url}: {
  readonly contractNames: readonly string[];
  readonly url: string;
}) => {
  const provider = new ethers.providers.JsonRpcProvider(url);
  const wallet = new ethers.Wallet(ANVIL_DEFAULT_WALLET_PRIVATE_KEY_DO_NOT_USE_YOU_WILL_GET_REKT, provider);

  const contractNameToDeploymentAddress: Record<string, string> = Object.fromEntries(
    await Promise.all(
      contractNames.map(async contractName => {
        const {abi, bytecode} = JSON.parse(fs.readFileSync(
            path.resolve('..', '..', 'packages', 'foundry', 'out', `${contractName}.sol`, `${contractName}.json`),
            'utf-8'
        ));
        const {address} = await new ethers.ContractFactory(abi, bytecode, wallet).deploy();
        return [contractName, address];
      })
    ),
  );
  return {contractNameToDeploymentAddress};
};

const deployContractsAndWriteModule = async ({
  contractNames,
  url,
}: {
  readonly contractNames: readonly string[];
  readonly url: string;
}) => {

  const {
    contractNameToDeploymentAddress,
  } = await deployContractsByName({contractNames, url});

  if (!fs.existsSync(path.resolve('dist'))) fs.mkdirSync('dist');

  // TODO: create the package here
  fs.writeFileSync(
    path.resolve('dist', 'index.ts'),
    `
import {ethers, Wallet} from 'ethers';
import * as ffjavascript from 'ffjavascript';

const ANVIL_DEFAULT_WALLET_PRIVATE_KEY_DO_NOT_USE_YOU_WILL_GET_REKT = "${ANVIL_DEFAULT_WALLET_PRIVATE_KEY_DO_NOT_USE_YOU_WILL_GET_REKT}";

const deployEtherFromFaucet = async ({
  to,
  provider,
  amount = ethers.utils.parseEther('1'),
}: {
  readonly to: string;
  readonly provider: ethers.providers.Provider;
  readonly amount?: ethers.BigNumber;
}) => {
  const wallet = new Wallet(
    ANVIL_DEFAULT_WALLET_PRIVATE_KEY_DO_NOT_USE_YOU_WILL_GET_REKT,
    provider,
  );
  const signedTransaction = await wallet.signTransaction(
    await wallet.populateTransaction({
      to,
      value: amount,
      chainId: (await provider.getNetwork()).chainId,
    })
  );
  return provider.sendTransaction(signedTransaction);
};

${contractNames
  .map(
    (contractName: string) => {
      const witnessCalculatorExport = fs.readFileSync(
        path.resolve('..', '..', 'build', `${contractName}_js`, 'witness_calculator.js'),
        'utf-8',
      );
      return [
        `function ${contractName}WitnessCalculatorThunk() {`,
        `  ${witnessCalculatorExport.substring('module.exports = '.length)}`,
        '  return async () => {',
        '    const [wasm, verificationKey] = await Promise.all([',
        `      fetch(\'/${contractName}.wasm\').then(e => e.arrayBuffer()),`,
        `      fetch(\'/${contractName}_verification_key.json\').then(e => e.json()),`,
        '    ]);',
        '    // @ts-expect-error missing-parameter',
        '    const witnessCalculator = await builder(wasm);',
        '    const createProofAndPublicSignals = async ({inputSignals}: {readonly inputSignals: object}) => {',
        '      const witnessBuffer = await witnessCalculator.calculateWTNSBin(',
        '        inputSignals,',
        '        0,',
        '      );',
        '      // @ts-expect-error global-script',
        `      const {proof, publicSignals} = await snarkjs.groth16.prove('\/${contractName}_final.zkey', witnessBuffer);`,
        '      // @ts-ignore',
        '      const {unstringifyBigInts} = ffjavascript.utils;',
        '      // @ts-ignore',
        '      const checkIsProofValid = (): Promise<boolean> => snarkjs.groth16.verify(verificationKey, publicSignals, proof);',
        '      const exportSolidityCallData = async (): Promise<string[]> => {',
        '        // https://gist.github.com/chnejohnson/c6d76ef15c108464539de535d48a7f9b',
        '        // @ts-ignore',
        '        const calldata = await snarkjs.groth16.exportSolidityCallData(', 
        '          unstringifyBigInts(proof),',
        '          unstringifyBigInts(publicSignals),',
        '        );',
        '        return JSON.parse(`[${calldata}]`);',
        '      };',
        '      return {proof, publicSignals, checkIsProofValid, exportSolidityCallData};',
        '    };',
        '    return {createProofAndPublicSignals, verificationKey};',
        '  }',
        '}',
      ].join('\n');
    },
  )
  .join('\n')
}

${contractNames.map((contractName: string) => `
export const ${contractName} = Object.freeze({
  ...${JSON.stringify(JSON.parse(fs.readFileSync(
    path.resolve('..', 'foundry', 'out', `${contractName}.sol`, `${contractName}.json`),
    'utf-8',
  )))},
  rpcUrl: "${url}",
  contractAddress: "${contractNameToDeploymentAddress[contractName]}",
  deployEtherFromFaucet,
  createZeroKnowledgeHelpersAsync: ${contractName}WitnessCalculatorThunk(),
});
  `.trim(),
)}
    `.trim(),
  );
};

const pipe = (
  child?: child_process.ChildProcess
) => {
  child?.stdout?.pipe(process.stdout);
  child?.stderr?.pipe(process.stderr);
  return child;
};

child_process.execSync('forge build', {stdio: 'inherit'});

const contractNames = fs.readdirSync(path.resolve('circuits'))
  .filter(e => e.endsWith('.circom'))
  .map(e => e.substring(0, e.lastIndexOf('.circom')));

void (async () => Promise.all([
  pipe(child_process.exec('anvil --chain-id 1337')),

  // Wait a little time to spin up the deployment.
  new Promise(resolve => setTimeout(resolve, 1000))
    .then(() => deployContractsAndWriteModule({
      contractNames,
      url: 'http://localhost:8545',
    })),
]))();
