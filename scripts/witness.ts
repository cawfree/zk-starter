import 'dotenv/config';

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

// @ts-ignore
import * as snarkjs from 'snarkjs';

import {nanoid} from 'nanoid';
import * as child_process from "child_process";

void (async () => {
  const circuit = 'Multiplier2';

  const id = nanoid();

  const input = path.resolve(os.tmpdir(), `${id}-input.json`);
  const pub = path.resolve(os.tmpdir(), `${id}-pub.json`);
  const witness = path.resolve(os.tmpdir(), `${id}-witness.wtns`);
  const proof = path.resolve(os.tmpdir(), `${id}-proof.json`);

  fs.writeFileSync(
    input,
    JSON.stringify({a: 3, b: 11}, undefined, 2)
  );

  // For this circuit, there are no public variables.
  fs.writeFileSync(pub, JSON.stringify({}));

  child_process.execSync(
    `node generate_witness.js ${circuit}.wasm ${input} ${witness}`,
   {stdio: 'inherit', cwd: path.resolve('build', `${circuit}_js`)},
  );

  child_process.execSync(
    `snarkjs groth16 prove ${circuit}_final.zkey ${witness} ${proof} ${pub}`,
    {stdio: 'inherit', cwd: path.resolve('build')},
  );

  const verificationKey = path.resolve('build', `${circuit}_verification_key.json`);

  const res = await snarkjs.groth16.verify(
    JSON.parse(fs.readFileSync(verificationKey, 'utf-8')),
    JSON.parse(fs.readFileSync(pub, 'utf-8')),
    JSON.parse(fs.readFileSync(proof, 'utf-8')),
  );

  const success = res === true;

  console.log(`Verification ${success ? 'Succeeded' : 'Failed'} ${success ? '✅' : '🚫'}`);
})();



