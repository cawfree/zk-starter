import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ext = '.circom';

const circuits = fs.readdirSync(path.resolve('packages', 'circuits'))
  .filter(e => e.endsWith(ext));

const opts = {stdio: 'inherit'} as const;

const publicDir = path.resolve('apps', 'web', 'public');
!fs.existsSync(publicDir) && fs.mkdirSync(publicDir);

circuits.forEach((circuit: string) => {
  const name = circuit.substring(0, circuit.lastIndexOf(ext));

  // Compile circuit.
  child_process.execSync(
    `circom ${path.resolve('packages', 'circuits', circuit)} -o build/ --r1cs --wasm`,
    opts,
  );

  // Setup.
  child_process.execSync(
   `yarn snarkjs groth16 setup build/${name}.r1cs build/pot15_final.ptau build/board_final.zkey`,
    opts,
  );

  child_process.execSync(
    `yarn snarkjs zkey new build/${name}.r1cs build/pot15_final.ptau build/${name}_0000.zkey`,
     opts,
  );

  // Ceremony similar to ptau, but for the circuit's zkey this time. Generate commits to the zkey with entropy.
  // Zkeys are intended to be hosted on IPFS, since the prover is required to encrypt their data passed into the wasm circuit.
  child_process.execSync(
   `yarn snarkjs zkey contribute build/${name}_0000.zkey build/${name}_0001.zkey --name="First ${name} contribution" -v -e="$(head -n 4096 /dev/urandom | openssl sha1)"`,
    opts,
  );
  child_process.execSync(
    `yarn snarkjs zkey contribute build/${name}_0001.zkey build/${name}_0002.zkey --name="Second ${name} contribution" -v -e="$(head -n 4096 /dev/urandom | openssl sha1)"`,
    opts,
  );
  child_process.execSync(
    `yarn snarkjs zkey contribute build/${name}_0002.zkey build/${name}_0003.zkey --name="Third ${name} contribution" -v -e="$(head -n 4096 /dev/urandom | openssl sha1)"`,
    opts,
  );

  // Verify zkey.
  child_process.execSync(
    `yarn snarkjs zkey verify build/${name}.r1cs build/pot15_final.ptau build/${name}_0003.zkey`,
    opts,
  );

  // Apply a random beacon.
  child_process.execSync(
    `yarn snarkjs zkey beacon build/${name}_0003.zkey build/${name}_final.zkey  0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="${name} FinalBeacon phase2"`,
    opts,
  );

  // Optional: verify the final zkey.
  child_process.execSync(
    `yarn snarkjs zkey verify build/${name}.r1cs build/pot15_final.ptau build/${name}_final.zkey`,
    opts,
  );

  // Export verification key. (Optional, but we can use this to check the proofs generated in the client prior to submission.)
  child_process.execSync(
    `yarn snarkjs zkey export verificationkey build/${name}_final.zkey build/${name}_verification_key.json`,
    opts,
  );

  const contractsDir = path.resolve('packages', 'foundry', 'src', 'generated');
  if (!fs.existsSync(contractsDir)) fs.mkdirSync(contractsDir);

  // Export matching solidity verifier.
  child_process.execSync(
    `yarn snarkjs zkey export solidityverifier build/${name}_final.zkey ${path.resolve(contractsDir, `${name}Verifier.sol`)}`,
    opts,
  );

  // Update the solidity version for compatibility with nested arrays.
  child_process.execSync(
    `sed -i.bak "s/0.6.11/0.8.11/g" ${path.resolve(contractsDir, `${name}Verifier.sol`)}`,
    opts,
  );

  // Remove the backup.
  fs.unlinkSync(path.resolve(contractsDir, `${name}Verifier.sol.bak`));


  child_process.execSync(
    `cp -rf ${path.resolve('build', `${name}_js`, `${name}.wasm`)} ${publicDir}/`,
    opts,
  );

  //child_process.execSync(
  //  `cp -rf ${path.resolve('build', `${name}_js`, 'witness_calculator.js')} ${path.resolve(publicDir, `${name}_witness_calculator.js`)}`,
  //  opts,
  //);

  child_process.execSync(
    `cp -rf ${path.resolve('build', `${name}_final.zkey`)} ${publicDir}/`,
    opts,
  );

  child_process.execSync(
    `cp -rf ${path.resolve('build', `${name}_verification_key.json`)} ${publicDir}/`,
    opts,
  );

});
