# `zk-starter`

The easiest way to integrate succinct verifiable on-chain computation using hidden information in custom applications that execute on a credibly-neutral immutable public ledger.

Essentially, it's [__zero knowledge__](https://en.wikipedia.org/wiki/Zero-knowledge_proof) for those with zero knowledge.

### 🚀 Getting Started

1. Clone the repository using `git clone https://github.com/cawfree/zk-starter`.
2. Make sure you've installed [__Rust__](https://www.rust-lang.org/) and [__Foundry__](https://github.com/foundry-rs/foundry):

```shell
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh # install rust
curl -L https://foundry.paradigm.xyz | bash # install foundry
```
3. Run `yarn`, which will install [`circom`](https://docs.circom.io/) and automate a new [__Powers of Tau__](https://zkproof.org/2021/06/30/setup-ceremonies/#:~:text=The%20first%20phase%20referred%20to,NP%2Drelation%2Dspecific%20CRS.) ceremony, then finally compile your arithmetic circuits. When you make changes to your circuits, you can also use `yarn` to recompile them alongside their dependent smart contracts.
 
> 💡 All the build artifacts are cached, so you'll only be required to do this once-per-installation.

> ⚠️ By default, `zk-starter` is configured not to track the results of ceremonies. You can delete the ignore flag of the `build/` directory within the [`.gitignore`](.gitignore) to avoid data loss. 

4. Finally, run `yarn dev` to execute the entire stack on [`http://localhost:3000`](http://localhost:3000). This will redeploy the auto-generated [__verifier logic__](https://docs.circom.io/getting-started/proving-circuits/) made available to your [__smart contracts__](https://ethereum.org/en/developers/docs/smart-contracts/) on the [`anvil`](https://github.com/foundry-rs/foundry) local chain and inject the relevant configuration properties into your frontend.

### ♻️ Adding New Circuits

`zk-starter`'s build life cycle ensures that for each new arithmetic circuit you build, a corresponding [__Solidity__](https://docs.soliditylang.org/en/v0.8.17/) smart contract which inherits a compatible verifier will also be initialized for you to extend.

Likewise, for each circuit you create, a matching utility library is presented to the applicaton frontend application compile time. This provides namespaced high-level functions for generating and verifying proofs, and abstracting away the complexity of smart contract invocation for on-chain verification.

### 🙏 Attribution

This monorepo was inspired by [__BattleZips 🏴‍☠️__](https://twitter.com/Battlezips) ([__Git__](https://github.com/BattleZips/BattleZips)). Thank you for helping increase accessibility to the state-of-the-art in modern cryptography.

### ✌️ License
[__MIT__](./LICENSE)
