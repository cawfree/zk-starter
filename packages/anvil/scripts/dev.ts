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
    path.resolve('..', '..', 'packages', 'ethereum', 'out', `${contractName}.sol`, `${contractName}.json`),
    'utf-8'
  ));

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  const contract = await factory.deploy();
  const {address: deploymentAddress} = contract;

  // TODO: create the package here
  fs.writeFileSync(
    path.resolve('dist', 'index.ts'),
    `
// @ts-expect-error missing declaration
const {abi, bytecode} = ${JSON.stringify(JSON.parse(fs.readFileSync(
  path.resolve('..', 'ethereum', 'out', `${contractName}.sol`, `${contractName}.json`),
 'utf-8',
)))};
    
export const ${contractName} = Object.freeze({
  ANVIL_DEFAULT_WALLET_PRIVATE_KEY_DO_NOT_USE_YOU_WILL_GET_REKT: "${ANVIL_DEFAULT_WALLET_PRIVATE_KEY_DO_NOT_USE_YOU_WILL_GET_REKT}",
  abi,
  bytecode,
  rpcUrl: "${url}",
  contractAddress: "${deploymentAddress}",
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

void (async () => Promise.all([
  pipe(child_process.exec('anvil')),

  // Wait a little time to spin up the deployment.
  new Promise(resolve => setTimeout(resolve, 1000))
    .then(() => deploy({
      contractName: 'Main',
      url: 'http://localhost:8545',
    })),
]))();
