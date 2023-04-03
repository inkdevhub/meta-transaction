import { ApiPromise, Keyring } from "@polkadot/api";
import InkMetaConstructor from "./typechain-generated/constructors/inkmetatransaction";
import InkMetaContract from "./typechain-generated/contracts/inkmetatransaction";
import FlipperConstructor from "./typechain-generated/constructors/flipper";
import FlipperContract from "./typechain-generated/contracts/flipper";
import { Transaction } from "./typechain-generated/types-arguments/inkmetatransaction";
import Web3 from "web3";
import { Result } from '@727-ventures/typechain-types';

async function main() {
    // Connect to the local node
    const api = await ApiPromise.create();

    // Create keyring pair for Alice and Bob
    // const keyring = new Keyring({ type: 'sr25519' });
    const keyring = new Keyring({ type: 'ecdsa' });

    // const aliceKeyringPair = keyring.addFromAddress("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");
    const aliceKeyringPair = keyring.addFromUri('//Alice');
    const bobKeyringPair = keyring.addFromUri('//Bob');

    // Create instance of constructors, that will be used to deploy contracts
    // Constructors contains all constructors from the contract
    const inkMetaConstructor = new InkMetaConstructor(api, aliceKeyringPair);
    const flipperConstructor = new FlipperConstructor(api, aliceKeyringPair);

    // Deploy contract via constructor
    const { address: INK_META_ADDRESS } = await inkMetaConstructor.default();
    const { address: FLIPPER_ADDRESS } = await flipperConstructor.new(false);

    console.log('Ink Meta Transaction contract deployed at:', INK_META_ADDRESS);
    console.log('Flipper contract deployed at:', FLIPPER_ADDRESS);

    const inkMetaContract = new InkMetaContract(INK_META_ADDRESS, aliceKeyringPair, api);
    const flipperContract = new FlipperContract(FLIPPER_ADDRESS, aliceKeyringPair, api);

    const alice_nonce = await inkMetaContract.query.getNonce(aliceKeyringPair.address);
    console.log(`%c Alice initial nonce: ${alice_nonce.value.unwrap().toNumber()}`, 'color: green');

    let flipper_status = await flipperContract.query.get();
    console.log(`%c Flipper get result?: ${flipper_status.value.ok}`, 'color: green');

    await flipperContract.tx.flip();
    flipper_status = await flipperContract.query.get();

    console.log(`%c After flip?: ${flipper_status.value.ok}`, 'color: green');

    await flipperContract.tx.flip();
    flipper_status = await flipperContract.query.get();

    console.log(`%c After another flip?: ${flipper_status.value.ok}`, 'color: green');


    // Transaction to call the flip() fn in the Flipper contract
    let transaction: Transaction = {
        callee: FLIPPER_ADDRESS,
        selector: ["63", "3a", "a5", "51"],
        input: [],
        transferredValue: 100,
        gasLimit: 1000000000,
        allowReentry: false,
        nonce: 0,
        expirationTimeSeconds: Date.now() + 100000
    }

    let hashed_transaction = Web3.utils.soliditySha3(JSON.stringify(transaction));
    console.log(`Hashed transaction: ${hashed_transaction}`);

    let signature_buffer: number[] = [];
    // Get the signature into the right type as expected by `execute`
    let signature = aliceKeyringPair.sign(hashed_transaction).forEach(b => {
        signature_buffer.push(b);
    });
    console.log(`Signature bytes: ${signature_buffer}`);

    // try {
    //     await inkMetaContract.withSigner(bobKeyringPair).query.execute(transaction, signature_buffer);
    // } catch ({ _err }) {
    //     console.log(_err);
    // }
    // let valid_res = await api.tx.balances.transfer(bobKeyringPair.address, 5000000).signAndSend(aliceKeyringPair);



    // let res = await inkMetaContract.tx.execute(transaction, signature_buffer).catch(e => console.log(JSON.stringify(e)));
    // console.log(`Execute result: ${res.result.isCompleted}`);






    // console.log(`%c Balance of Alice before transfer: ${balance.value.unwrap()}`, 'color: green');

    // const mintTx = await contract.tx.transfer(bobKeyringPair.address, 1, []);

    // const totalSupplyAfterMint = await contract.query.totalSupply();
    // const balanceAfterMint = await contract.query.balanceOf(aliceKeyringPair.address);

    // console.log(`%c Total supply after transfer: ${totalSupplyAfterMint.value.unwrap().toNumber()}`, 'color: green');
    // console.log(`%c Balance of Alice after transfer: ${balanceAfterMint.value.unwrap()}`, 'color: green');

    await api.disconnect();
}

main().then(() => {
    console.log('done');
});
