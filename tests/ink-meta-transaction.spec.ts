import { ApiPromise } from "@polkadot/api";
import { Keyring } from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import * as crypto from '@polkadot/util-crypto';
import InkMetaConstructor from "../typechain-generated/constructors/inkmetatransaction";
import InkMetaContract from "../typechain-generated/contracts/inkmetatransaction";
import FlipperConstructor from "../typechain-generated/constructors/flipper";
import FlipperContract from "../typechain-generated/contracts/flipper";
import { Transaction, Error } from "../typechain-generated/types-arguments/inkmetatransaction";
import * as $ from "scale-codec"
import type { WeightV2 } from '@polkadot/types/interfaces';


describe('Ink Meta Transaction', () => {
    let api: ApiPromise;
    let keyring: Keyring;
    let alice: KeyringPair;
    let bob: KeyringPair;

    let inkMetaConstructor: InkMetaConstructor;
    let flipperConstructor: FlipperConstructor;

    let inkMetaContract: InkMetaContract;
    let flipperContract: FlipperContract;

    let INK_META_ADDRESS: string;
    let FLIPPER_ADDRESS: string;

    let FLIPPER_DEFAULT = false;

    let gasRequired: WeightV2;

    const $transaction_codec = $.object(
        $.field("from", $.sizedUint8Array(32)),
        $.field("callee", $.sizedUint8Array(32)),
        $.field("selector", $.sizedUint8Array(4)),
        $.field("input", $.uint8Array),
        $.field("transferredValue", $.u128),
        $.field("gasLimit", $.u64),
        $.field("allowReentry", $.bool),
        $.field("nonce", $.u128),
        $.field("expirationTimeSeconds", $.u64)
    );

    async function setup(): Promise<void> {
        ({ api, keyring: keyring, alice: alice, bob: bob } = globalThis.setup);

        // Create instance of constructors, that will be used to deploy contracts
        // Constructors contains all constructors from the contract
        inkMetaConstructor = new InkMetaConstructor(api, alice);
        flipperConstructor = new FlipperConstructor(api, alice);

        // Deploy contract via constructor
        INK_META_ADDRESS = (await inkMetaConstructor.default()).address;
        FLIPPER_ADDRESS = (await flipperConstructor.new(FLIPPER_DEFAULT)).address;

        console.log('Ink Meta Transaction contract deployed at:', INK_META_ADDRESS);
        console.log('Flipper contract deployed at:', FLIPPER_ADDRESS);

        inkMetaContract = new InkMetaContract(INK_META_ADDRESS, alice, api);
        flipperContract = new FlipperContract(FLIPPER_ADDRESS, alice, api);
    }

    it('flip works', async () => {
        await setup();
        expect((await flipperContract.query.get()).value.ok).toBe(FLIPPER_DEFAULT);

        ({ gasRequired } = await flipperContract
            .withSigner(alice)
            .query.flip());
        console.log(`Gas for flip(): ${gasRequired}`);

        await flipperContract
            .withSigner(alice)
            .tx.flip({ gasLimit: gasRequired });

        expect((await flipperContract.query.get()).value.ok).toBe(!FLIPPER_DEFAULT);
    });

    it('verify works', async () => {
        let decoded_address = keyring.decodeAddress(FLIPPER_ADDRESS);
        console.log(decoded_address);

        console.log(`Alice pub key: ${alice.publicKey}`);
        console.log(`Alice address: ${keyring.decodeAddress(alice.address)}`);

        let from: Uint8Array = alice.addressRaw;
        let selector: number[] = [99, 58, 165, 81];
        let input: number[] = [];
        let transferredValue: number = 0;
        let gasLimit: number = 1000000000;
        let allowReentry: boolean = false;
        let nonce: number = 0;
        // let expirationTimeSeconds: number = 1677782453176 + 100000000;
        let expirationTimeSeconds: number = Date.now() + 100000000;

        // Transaction to call the flip() fn in the Flipper contract
        let transaction: Transaction = {
            from: Array.from(from),
            callee: Array.from(decoded_address),
            selector: selector /* [0x63, 0x3a, 0xa5, 0x51]*/,
            input: input,
            transferredValue: transferredValue,
            gasLimit: gasLimit,
            allowReentry: allowReentry,
            nonce: nonce,
            expirationTimeSeconds: expirationTimeSeconds
        }

        let transaction_for_encoding = {
            from: from,
            callee: decoded_address,
            selector: Uint8Array.from(selector),
            input: Uint8Array.from(input),
            transferredValue: BigInt(transferredValue),
            gasLimit: BigInt(gasLimit),
            allowReentry: transaction.allowReentry,
            nonce: BigInt(nonce),
            expirationTimeSeconds: BigInt(expirationTimeSeconds)
        }

        let encoded_transaction = $transaction_codec.encode(transaction_for_encoding);
        console.log(`Encoded transaction Uint8Array: ${encoded_transaction}`);
        console.log(`Encoded transaction toString(): ${encoded_transaction.toString()}`);

        // The same account in transaction.from is the account that signs the transaction
        let signature = alice.sign(encoded_transaction);

        console.log(`Signature: ${Array.from(signature).length}`);

        const isValid = alice.verify(encoded_transaction, signature, alice.publicKey);
        console.log(`isValid: ${isValid}`);

        let res = await inkMetaContract.query.verfiy(transaction, Array.from(signature));
        console.log(res.value.ok.err);
        expect(res.value.ok.err === undefined);
    });

    it('verify: throws IncorrectNonce', async () => {
        let decoded_address = keyring.decodeAddress(FLIPPER_ADDRESS);
        console.log(decoded_address);

        console.log(`Alice pub key: ${alice.publicKey}`);
        console.log(`Alice address: ${keyring.decodeAddress(alice.address)}`);

        let from = alice.addressRaw;
        let selector: number[] = [99, 58, 165, 81];
        let input: number[] = [];
        let transferredValue: number = 0;
        let gasLimit: number = 1000000000;
        let allowReentry: boolean = false;
        let nonce: number = 1;
        // let expirationTimeSeconds: number = 1677782453176 + 100000000;
        let expirationTimeSeconds: number = Date.now() + 100000000;

        // Transaction to call the flip() fn in the Flipper contract
        let transaction: Transaction = {
            from: Array.from(from),
            callee: Array.from(decoded_address),
            selector: selector /* [0x63, 0x3a, 0xa5, 0x51]*/,
            input: input,
            transferredValue: transferredValue,
            gasLimit: gasLimit,
            allowReentry: allowReentry,
            nonce: nonce,
            expirationTimeSeconds: expirationTimeSeconds
        }

        let transaction_for_encoding = {
            from: from,
            callee: decoded_address,
            selector: Uint8Array.from(selector),
            input: Uint8Array.from(input),
            transferredValue: BigInt(transferredValue),
            gasLimit: BigInt(gasLimit),
            allowReentry: transaction.allowReentry,
            nonce: BigInt(nonce),
            expirationTimeSeconds: BigInt(expirationTimeSeconds)
        }

        let encoded_transaction = $transaction_codec.encode(transaction_for_encoding);
        console.log(`Encoded transaction Uint8Array: ${encoded_transaction}`);
        console.log(`Encoded transaction toString(): ${encoded_transaction.toString()}`);

        let signature = alice.sign(encoded_transaction);

        console.log(`Signature: ${Array.from(signature).length}`);

        const isValid = alice.verify(encoded_transaction, signature, alice.publicKey);
        console.log(`isValid: ${isValid}`);

        let res = await inkMetaContract.query.verfiy(transaction, Array.from(signature));
        console.log(res.value.ok.err);
        expect(res.value.ok.err == Error.incorrectNonce);
    });

    it('verify: submit incorrect signature for transaction ', async () => {
        let decoded_address = keyring.decodeAddress(FLIPPER_ADDRESS);
        console.log(decoded_address);

        console.log(`Alice pub key: ${alice.publicKey}`);
        console.log(`Alice address: ${keyring.decodeAddress(alice.address)}`);

        let from = alice.addressRaw;
        let selector: number[] = [99, 58, 165, 81];
        let input: number[] = [];
        let transferredValue: number = 0;
        let gasLimit: number = 1000000000;
        let allowReentry: boolean = false;
        let nonce: number = 0;
        // let expirationTimeSeconds: number = 1677782453176 + 100000000;
        let expirationTimeSeconds: number = Date.now() + 100000000;

        // Transaction to call the flip() fn in the Flipper contract
        let transaction: Transaction = {
            from: Array.from(from),
            callee: Array.from(decoded_address),
            selector: selector /* [0x63, 0x3a, 0xa5, 0x51]*/,
            input: input,
            transferredValue: transferredValue,
            gasLimit: gasLimit,
            allowReentry: allowReentry,
            nonce: nonce,
            expirationTimeSeconds: expirationTimeSeconds
        }

        let transaction_for_encoding = {
            from: from,
            callee: decoded_address,
            selector: Uint8Array.from(selector),
            input: Uint8Array.from(input),
            transferredValue: BigInt(transferredValue),
            gasLimit: BigInt(gasLimit),
            allowReentry: transaction.allowReentry,
            nonce: BigInt(nonce),
            // +1 TO MAKE DIFFERENT FROM SUBMITTED TRANSACTION. SIGNATURE WILL NOT MATCH
            expirationTimeSeconds: BigInt(expirationTimeSeconds + 1)
        }

        let encoded_transaction = $transaction_codec.encode(transaction_for_encoding);
        console.log(`Encoded transaction Uint8Array: ${encoded_transaction}`);
        console.log(`Encoded transaction toString(): ${encoded_transaction.toString()}`);

        let signature = alice.sign(encoded_transaction);

        console.log(`Signature: ${Array.from(signature).length}`);

        const isValid = alice.verify(encoded_transaction, signature, alice.publicKey);
        console.log(`isValid: ${isValid}`);

        let res = await inkMetaContract.query.verfiy(transaction, Array.from(signature));
        console.log(res.value.ok.err);
        expect(res.value.ok.err == Error.incorrectSignature);
    });


    it('execute works', async () => {
        let decoded_address = keyring.decodeAddress(FLIPPER_ADDRESS);
        console.log(decoded_address);

        console.log(`Alice pub key: ${alice.publicKey}`);
        console.log(`Alice address: ${keyring.decodeAddress(alice.address)}`);

        let from = alice.addressRaw;
        let selector: number[] = [99, 58, 165, 81];
        let input: number[] = [];
        let transferredValue: number = 0;
        let gasLimit: number = 1000000000;
        let allowReentry: boolean = false;
        let nonce: number = 0;
        let expirationTimeSeconds: number = Date.now() + 1000000000;

        // Transaction to call the flip() fn in the Flipper contract
        let transaction: Transaction = {
            from: Array.from(from),
            callee: Array.from(decoded_address),
            selector: selector /* [0x63, 0x3a, 0xa5, 0x51]*/,
            input: input,
            transferredValue: transferredValue,
            gasLimit: gasLimit,
            allowReentry: allowReentry,
            nonce: nonce,
            expirationTimeSeconds: expirationTimeSeconds
        }

        let transaction_for_encoding = {
            from: from,
            callee: decoded_address,
            selector: Uint8Array.from(selector),
            input: Uint8Array.from(input),
            transferredValue: BigInt(transferredValue),
            gasLimit: BigInt(gasLimit),
            allowReentry: transaction.allowReentry,
            nonce: BigInt(nonce),
            expirationTimeSeconds: BigInt(expirationTimeSeconds)
        }

        let encoded_transaction = $transaction_codec.encode(transaction_for_encoding);
        console.log(`Encoded transaction Uint8Array: ${encoded_transaction}`);

        let signature = alice.sign(encoded_transaction);
        console.log(`Signature length: ${Array.from(signature).length}`);

        const isValid = alice.verify(encoded_transaction, signature, alice.publicKey);
        console.log(`isValid: ${isValid}`);

        ({ gasRequired } = await inkMetaContract
            .withSigner(alice)
            .query.execute(transaction, Array.from(signature)));
        console.log(`Gas for execute(): ${gasRequired}`);

        // Get initial flipper value
        let flipper_value = (await flipperContract.query.get()).value.ok;
        console.log(`flipper value init: ${(await flipperContract.query.get()).value.ok}`);

        // Get inital nonce
        let init_nonce = (await inkMetaContract.query.getNonce(alice.address)).value.ok.toNumber();
        console.log(`init_nonce: ${init_nonce}`);
        expect(init_nonce == 0);

        // Flip the value
        // Important note: Bob calls execute, but it is alice's transaction inside that is executed
        // In other words, Alice gives Bob her transaction to execute on her behalf
        let res = await inkMetaContract
            .withSigner(bob)
            .tx.execute(transaction, Array.from(signature), { gasLimit: gasRequired, value: transferredValue });

        // Assert Executed event was emitted
        console.log(res.events[0]);
        expect(res.events[0].name == "Executed");

        // Value should now be the flipped value of `flipper_value`
        console.log(`flipper value after tx.flip(): ${(await flipperContract.query.get()).value.ok}`);
        expect((await flipperContract.query.get()).value.ok).toBe(!flipper_value);

        // Get incremented nonce
        // Note: Alice's nonce is incremented, not Bob's
        let incremented_nonce = (await inkMetaContract.query.getNonce(alice.address)).value.ok.toNumber();
        console.log(`incremented_nonce: ${incremented_nonce}`);
        expect(incremented_nonce == 1);
    });

    it('execute: throws TransactionExpired', async () => {
        let decoded_address = keyring.decodeAddress(FLIPPER_ADDRESS);
        console.log(decoded_address);

        console.log(`Alice pub key: ${alice.publicKey}`);
        console.log(`Alice address: ${keyring.decodeAddress(alice.address)}`);

        let from = alice.addressRaw;
        let selector: number[] = [99, 58, 165, 81];
        let input: number[] = [];
        let transferredValue: number = 0;
        let gasLimit: number = 1000000000;
        let allowReentry: boolean = false;
        let nonce: number = 0;
        let expirationTimeSeconds: number = Date.now() - 1000000;

        // Transaction to call the flip() fn in the Flipper contract
        let transaction: Transaction = {
            from: Array.from(from),
            callee: Array.from(decoded_address),
            selector: selector /* [0x63, 0x3a, 0xa5, 0x51]*/,
            input: input,
            transferredValue: transferredValue,
            gasLimit: gasLimit,
            allowReentry: allowReentry,
            nonce: nonce,
            expirationTimeSeconds: expirationTimeSeconds
        }

        let transaction_for_encoding = {
            from: from,
            callee: decoded_address,
            selector: Uint8Array.from(selector),
            input: Uint8Array.from(input),
            transferredValue: BigInt(transferredValue),
            gasLimit: BigInt(gasLimit),
            allowReentry: transaction.allowReentry,
            nonce: BigInt(nonce),
            expirationTimeSeconds: BigInt(expirationTimeSeconds)
        }

        let encoded_transaction = $transaction_codec.encode(transaction_for_encoding);
        console.log(`Encoded transaction Uint8Array: ${encoded_transaction}`);

        let signature = alice.sign(encoded_transaction);
        console.log(`Signature length: ${Array.from(signature).length}`);

        const isValid = alice.verify(encoded_transaction, signature, alice.publicKey);
        console.log(`isValid: ${isValid}`);

        // Transaction expired. 
        let expired_transaction = await inkMetaContract
            .query.execute(transaction, Array.from(signature));

        console.log(`expired_transaction: ${expired_transaction.value.ok.err}`);
        expect(expired_transaction.value.ok.err == Error.transactionExpired);
    });

    it('execute: throws ValueTransferredMismatch', async () => {
        let decoded_address = keyring.decodeAddress(FLIPPER_ADDRESS);
        console.log(decoded_address);

        console.log(`Alice pub key: ${alice.publicKey}`);
        console.log(`Alice address: ${keyring.decodeAddress(alice.address)}`);

        let from = alice.addressRaw;
        let selector: number[] = [99, 58, 165, 81];
        let input: number[] = [];
        let transferredValue: number = 0;
        let gasLimit: number = 1000000000;
        let allowReentry: boolean = false;
        let nonce: number = 0;
        let expirationTimeSeconds: number = Date.now() - 1000000;

        // Transaction to call the flip() fn in the Flipper contract
        let transaction: Transaction = {
            from: Array.from(from),
            callee: Array.from(decoded_address),
            selector: selector /* [0x63, 0x3a, 0xa5, 0x51]*/,
            input: input,
            transferredValue: transferredValue,
            gasLimit: gasLimit,
            allowReentry: allowReentry,
            nonce: nonce,
            expirationTimeSeconds: expirationTimeSeconds
        }

        let transaction_for_encoding = {
            from: from,
            callee: decoded_address,
            selector: Uint8Array.from(selector),
            input: Uint8Array.from(input),
            transferredValue: BigInt(transferredValue),
            gasLimit: BigInt(gasLimit),
            allowReentry: transaction.allowReentry,
            nonce: BigInt(nonce),
            expirationTimeSeconds: BigInt(expirationTimeSeconds)
        }

        let encoded_transaction = $transaction_codec.encode(transaction_for_encoding);
        console.log(`Encoded transaction Uint8Array: ${encoded_transaction}`);

        let signature = alice.sign(encoded_transaction);
        console.log(`Signature length: ${Array.from(signature).length}`);

        const isValid = alice.verify(encoded_transaction, signature, alice.publicKey);
        console.log(`isValid: ${isValid}`);

        // ---- Test ValueTransferredMismatch error ----
        let bad_value_transaction = await inkMetaContract
            .query.execute(transaction, Array.from(signature), { value: 1 });

        console.log(`bad_value_transaction: ${bad_value_transaction.value.ok.err}`);
        expect(bad_value_transaction.value.ok.err == Error.valueTransferMismatch);
    });
});

// function revertedWith(
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     result: { value: { err?: any } },
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
//     errorTitle: any,
// ): void {
//     if (result.value instanceof Result) {
//         console.log("First if");
//         result.value = result.value.ok;
//     }
//     if (typeof errorTitle === 'object') {
//         expect(result.value).toHaveProperty('err', errorTitle);
//     } else {
//         console.log(`Err: ${result.value.err}`);
//         expect(result.value.err).toHaveProperty(errorTitle);
//     }
// }