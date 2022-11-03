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

// Rebuild circom if it does not exist.
if (!fs.existsSync(circomBuildPath))
  child_process.execSync(
    'cargo build --release && cargo install --path circom',
    {stdio: 'inherit', cwd: circomDir},
  );

