# Minimal Forwarder (Meta Transaction)
This is a translation of the Open Zeppelin [Minimal Forwarder contract](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/metatx/MinimalForwarder.sol) into [ink!](https://use.ink/) complying with [ERC2771](https://eips.ethereum.org/EIPS/eip-2771) standard. It allows you to create your own transaction and signature, but send them to a 3rd party who will submit them to the chain for you through this contract and they pay all the gas fees for you.

The contract is located in `contracts/forwarder`. Example contracts Registry/Flipper are also in the `contracts/` directory. This is only here for use in testing `meta-transaction`.

- `Forwarder` - Forwarder contracts verify signers' signature and forward transaction requests to actual recipient contracts.
- `MetaTxContext` - Recipient contracts which want to make use of signers' information need to implements `MetaTxContext` trait.
- `Registry` - An example contract implementing `MetaTxContext`.
- `Flipper` - An example contract implementing `MetaTxContext`.

## Setup
As a precursor, you will need the [Swanky Node](https://github.com/AstarNetwork/swanky-node) or any other development nodes such as Substrate Contracts Node running.

This will compile all contracts under `contracts/` folder and generate typescript types and binding codes automatically.
```
yarn compile
```

In case it fails for some reason, you can also setup one by one.

1) Compile our contracts:
```bash
$ cargo contract build --manifest-path ./contracts/forwarder/Cargo.toml
$ cargo contract build --manifest-path ./contracts/flipper/Cargo.toml
$ cargo contract build --manifest-path ./contracts/registry/Cargo.toml
```

2) Install the npm dependencies:
```bash
$ yarn
# or
$ npm i
```

3) Copy contract files to the `./tests/artifacts` folder:
```bash
$ cp ./target/ink/forwarder/forwarder.contract ./tests/artifacts
$ cp ./target/ink/flipper/flipper.contract ./tests/artifacts
$ cp ./target/ink/registry/registry.contract ./tests/artifacts
```
And metadata:
```bash
$ cp ./target/ink/forwarder/forwarder.contract ./tests/artifacts
$ cp ./target/ink/flipper/flipper.json ./tests/artifacts
$ cp ./target/ink/registry/registry.json ./tests/artifacts

```

4) Generate types and binding files with `typechain-polkadot`:
```bash
$ npx typechain-polkadot --in ./tests/artifacts --out ./tests/typedContracts
```

## Testing
To run the test suite:
```bash
$ yarn test
# or
$ npm run test
```
