import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';

const buildDir = path.resolve('build');

if (!fs.existsSync(buildDir))
  fs.mkdirSync(buildDir);

const circomDir = path.resolve(buildDir, 'circom');

if (!fs.existsSync(circomDir))
  child_process.execSync(
    'git clone https://github.com/iden3/circom.git',
    {stdio: 'inherit', cwd: buildDir},
  );

const circomBuildPath = path.resolve(buildDir, 'target', 'release');

if (!fs.existsSync(circomBuildPath))
  child_process.execSync(
    'cargo build --release && cargo install --path circom',
    {stdio: 'inherit', cwd: circomDir},
  );

const powersOfTauFinal = path.resolve('build', 'pot15_final.ptau'); // 🦄

if (!fs.existsSync(powersOfTauFinal))
  child_process.execSync('./scripts/ptau.sh', {stdio: 'inherit'});

// Rebuild the circuits.
child_process.execSync('yarn circuits', {stdio: 'inherit'});
