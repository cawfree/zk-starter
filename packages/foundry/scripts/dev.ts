import * as child_process from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

import {ethers} from 'ethers';

const ANVIL_DEFAULT_WALLET_PRIVATE_KEY_DO_NOT_USE_YOU_WILL_GET_REKT = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const deploy = async ({
  contractName,
  url,
}: {
  readonly contractName: string;
  readonly url: string;
}) => {

  const provider = new ethers.providers.JsonRpcProvider(url);
  const wallet = new ethers.Wallet(ANVIL_DEFAULT_WALLET_PRIVATE_KEY_DO_NOT_USE_YOU_WILL_GET_REKT, provider);

  const {abi, bytecode} = JSON.parse(fs.readFileSync(
    path.resolve('..', '..', 'packages', 'foundry', 'out', `${contractName}.sol`, `${contractName}.json`),
    'utf-8'
  ));

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  const contract = await factory.deploy();
  const {address: deploymentAddress} = contract;

  if (!fs.existsSync(path.resolve('dist'))) fs.mkdirSync('dist');

  // TODO: create the package here
  fs.writeFileSync(
    path.resolve('dist', 'index.ts'),
    `
import {ethers, Wallet} from 'ethers';

// @ts-expect-error missing declaration
const {abi, bytecode} = ${JSON.stringify(JSON.parse(fs.readFileSync(
  path.resolve('..', 'foundry', 'out', `${contractName}.sol`, `${contractName}.json`),
 'utf-8',
)))};

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
    
export const ${contractName} = Object.freeze({
  abi,
  bytecode,
  rpcUrl: "${url}",
  contractAddress: "${deploymentAddress}",
  deployEtherFromFaucet,
});
    `.trim(),
  );

  console.log(`Deployed ${contractName}.sol to: ${deploymentAddress}!`);
};

const pipe = (
  child?: child_process.ChildProcess
) => {
  child?.stdout?.pipe(process.stdout);
  child?.stderr?.pipe(process.stderr);
  return child;
};

child_process.execSync('forge build', {stdio: 'inherit'});

void (async () => Promise.all([
  pipe(child_process.exec('anvil --chain-id 1337')),

  // Wait a little time to spin up the deployment.
  new Promise(resolve => setTimeout(resolve, 1000))
    .then(() => deploy({
      contractName: 'Main',
      url: 'http://localhost:8545',
    })),
]))();
