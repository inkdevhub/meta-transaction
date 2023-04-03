# Minimal Forwarder (inkmetatransaction)
This is a translation of the Open Zeppelin [Minimal Forwarder contract](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/metatx/MinimalForwarder.sol) into [ink!](https://use.ink/). It allows you to create your own transaction and signature, but send them to a 3rd party who will submit them to the chain for you through this contract and they pay all the gas fees for you.

The contract is located in `contracts/inkmetatransaction`. The Flipper contract is also in the `contracts/` directory. This is only here for use in testing `inkmetatransaction`. I would have dashes in the contract name, but typechain-polkadot doesn't work with names that are not one single word. I submitted the bug to the team.

## Setup
As a precursor, you will need the Substrate Contracts Node running.

1) Now, we need to compile our contracts:
```bash
cd ./contracts/inkmetatransaction
cargo contract build
cd ../flipper
cargo contract build
```

2) And now, let's get back to our top level directory and install the npm dependencies:
```bash
$ cd ../../
$ npm i
```

3) Let's create a directory for artifacts:
```bash
$ mkdir artifacts
```

4) And now, let's copy our artifacts to the `artifacts` directory:
```bash
$ cp ./target/ink/inkmetatransaction/inkmetatransaction.contract artifacts
$ cp ./target/ink/flipper/flipper.contract artifacts
```
And metadata now:
```bash
$ cp ./target/ink/inkmetatransaction/inkmetatransaction.json artifacts
$ cp ./target/ink/flipper/flipper.json artifacts
```

5) Let's run `typechain-polkadot` to generate our type files:
```bash
$ npx @727-ventures/typechain-polkadot --in ./artifacts --out ./typechain-generated
```

## Testing
To run the test suite:
```bash
$ npm run test:typechain
```

You will get many errors, but if you scroll up will will find an error that looks like this, which is Alice trying to execute a transaction but failing because she has no funds.
```
 {
    from: '5C7C2Z5sWbytvHpuLTvzKunnnRwQxft1jiqrLD5rhucQ5S9X',
    txHash: '0x271a298e666b6a2baf8021be67dccff7183dda45b98e5cd007a20a6fe666abf8',
    error: {
        message: '1010: Invalid Transaction: Inability to pay some fees , e.g. account balance too low'
    }
}
```
The contracts node has a default account created for Alice ("//Alice") and Bob ("//Bob") but those are with sr25519. The tests here are running with these generated using edcsa instead, so they have different addresses. We will need to transfer some tokens to both of them so that they can submit transactions in these tests. 

So copy the "from" address from the error you get, go to your contracts node page on polkadot.js[https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/accounts] and send 100,000 or so tokens from one of the default accounts to the address in "from".

Now run this command again.
```bash
$ npm run test:typechain
```

You will get the same error one more time, but this time "from will be a different address. Do the same thing again. Send 100,000 or so tokens from any default account to the address in the "from" field.

Now both accounts should be funded for execution.
Finally, run this command one more time:
```bash
$ npm run test:typechain
```

Now we can see that all tests are passing 🎉