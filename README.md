# `zk-starter`

The easiest way to integrate succinct verifiable on-chain computation using hidden information in custom applications that execute on a credibly-neutral public ledger.

Essentially, it's [__zero knowledge__](https://en.wikipedia.org/wiki/Zero-knowledge_proof) for those with zero knowledge.

### Getting Started

1. Clone the repository using `git clone https://github.com/cawfree/zk-starter`.
2. Make sure you've installed [__Rust__](https://www.rust-lang.org/):

```shell
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh # install rust
```
3. Run `yarn`, which will prepare your environment with the following steps:
 
```shell
git clone https://github.com/iden3/circom.git # clone circom
cd circom/target/release && cargo build --release && cargo install --path circom # install circom
./scripts/ptau.sh # execute the powers of tau ceremony
```

> All the build artifacts are cached, so you'll only be required to do this once-per-installation. If you'd like to use a larger number of constraints for your `.ptau`, you can download and verify results from public ceremonies [__here__](https://www.dropbox.com/sh/mn47gnepqu88mzl/AACaJkBU7mmCq8uU8ml0-0fma?dl=0).

### Attribution

This monorepo was inspired by [__BattleZips__](https://twitter.com/Battlezips). Thank you for helping democratize access to the state-of-the-art in modern cryptographic theory and thereby empowering even more humans to live safer self-sovereign digital existences.

### License
[__MIT__](./LICENSE)
