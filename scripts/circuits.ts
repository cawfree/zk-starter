import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ext = '.circom';

const circuits = fs.readdirSync('circuits')
  .filter(e => e.endsWith(ext));

const opts = {stdio: 'inherit'} as const;

circuits.forEach((circuit: string) => {
  const name = circuit.substring(0, circuit.lastIndexOf(ext));

  // Compile circuit.
  child_process.execSync(
    `circom circuits/${circuit} -o build/ --r1cs --wasm`,
    opts,
  );

  // Setup.
  child_process.execSync(
   `yarn snarkjs groth16 setup build/${name}.r1cs build/pot15_final.ptau build/board_final.zkey`,
    opts,
  );

  // Generate reference zkey.
  child_process.execSync(
    `yarn snarkjs zkey new build/${name}.r1cs build/pot15_final.ptau build/${name}_0000.zkey`,
     opts,
  );

  // Ceremony similar to ptau, but for the circuit's zkey this time.
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

  // Export verification key.
  child_process.execSync(
    `yarn snarkjs zkey export verificationkey build/${name}_final.zkey build/${name}_verification_key.json`,
    opts,
  );

  const contractsDir = path.resolve('build', 'contracts');

  if (!fs.existsSync(contractsDir)) fs.mkdirSync(contractsDir);

  // Export matching solidity verifier.
  child_process.execSync(
    `yarn snarkjs zkey export solidityverifier build/${name}_final.zkey build/contracts/${name}Verifier.sol`,
    opts,
  );
});
