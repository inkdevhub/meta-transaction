import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import Forwarder from "./typedContracts/constructors/forwarder";
import ForwarderContract from "./typedContracts/contracts/forwarder";
import Registry from "./typedContracts/constructors/registry";
import RegistryContract from "./typedContracts/contracts/registry";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { Transaction } from "./typedContracts/types-arguments/forwarder";
import * as $ from "scale-codec"

use(chaiAsPromised);

// Create a new instance of contract
const wsProvider = new WsProvider("ws://127.0.0.1:9944");
// Create a keyring instance
const keyring = new Keyring({ type: "sr25519" });

describe("Registry meta tx test", () => {
  let forwarder: ForwarderContract;
  let registry: RegistryContract;
  let api: ApiPromise;
  let deployer: KeyringPair;
  let alice: KeyringPair;
  let bob: KeyringPair;

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

  before(async function setup(): Promise<void> {
    api = await ApiPromise.create({ provider: wsProvider });
    deployer = keyring.addFromUri("//Alice");
    alice = keyring.addFromUri("//Alice",);
    bob = keyring.addFromUri("//Bob");

    let forwarderConstructor = new Forwarder(api, deployer);
    let forwarderAddress = (await forwarderConstructor.default()).address;
    forwarder = new ForwarderContract(
        forwarderAddress,
        deployer,
        api
    );

    let registryConstructor = new Registry(api, deployer);
    registry = new RegistryContract(
      (await registryConstructor.new(forwarderAddress)).address,
      deployer,
      api
    );
  });

  after(async function tearDown() {
    await api.disconnect();
  });

  it("Register name works", async () => {
    const name = "test name";
    const { gasRequired } = await registry
      .withSigner(alice)
      .query.register(name, []);

    await expect(
      registry.withSigner(alice).tx.register(
        name, [], {
        gasLimit: gasRequired,
      })
    ).to.eventually.be.fulfilled;

    expect(
      (await registry.query.getName(alice.address)).value.ok?.toString()
    ).to.be.equal(name);
  });

  it("Verify works", async () => {
    const keyring = new Keyring({ type: 'ecdsa' });
    const alice = keyring.addFromUri('//Alice');

    let from: Uint8Array = alice.addressRaw;
    let callee: Uint8Array = keyring.decodeAddress(registry.address);
    let selector: number[] = [34, 155, 85, 63]; // register
    let input: number[] = [];
    let transferredValue: number = 0;
    let gasLimit: number = 1000000000;
    let allowReentry: boolean = false;
    let nonce: number = 0;
    let expirationTimeSeconds: number = Date.now() + 100000000;

    let encoded_name = $.str.encode("test");
    input = input.concat(Array.from(encoded_name));

    // Transaction to call the flip() fn in the Flipper contract
    let transaction: Transaction = {
        from: Array.from(from),
        callee: Array.from(callee),
        selector: selector,
        input: input,
        transferredValue: transferredValue,
        gasLimit: gasLimit,
        allowReentry: allowReentry,
        nonce: nonce,
        expirationTimeSeconds: expirationTimeSeconds
    }

    let transaction_for_encoding = {
        from: from,
        callee: callee,
        selector: Uint8Array.from(selector),
        input: Uint8Array.from(input),
        transferredValue: BigInt(transferredValue),
        gasLimit: BigInt(gasLimit),
        allowReentry: transaction.allowReentry,
        nonce: BigInt(nonce),
        expirationTimeSeconds: BigInt(expirationTimeSeconds)
    }

    let encoded_transaction = $transaction_codec.encode(transaction_for_encoding);
    let signature = alice.sign(encoded_transaction);

    let res = await forwarder.query.verfiy(transaction, Array.from(signature));
    expect(res.value.ok?.err).to.be.equal(undefined);
  })

  // With meta transaction
  it("Register meta tx works", async () => {
    const keyring = new Keyring({ type: 'ecdsa' });
    const ecdsa_alice = keyring.addFromUri('//Alice');

    // Senario 
    // ecdsa_alice account who doesn't have any balance wants to register her name to register contract
    // 1. ecdsa_alice sign transaction signature.
    // 2. bob (with enough balance) execute forwarder contract `execute` function with ecdsa_alice's signature.
    // 3. check the registered name in registry contract.

    let from: Uint8Array = ecdsa_alice.addressRaw;
    let callee: Uint8Array = keyring.decodeAddress(registry.address);
    let selector: number[] = [34, 155, 85, 63]; // register
    let input: number[] = [];
    let transferredValue: number = 0;
    let gasLimit: number = 1000000000;
    let allowReentry: boolean = false;
    let nonce: number = 0;
    let expirationTimeSeconds: number = Date.now() + 100000000;

    const name = "test";
    let encoded_name = $.str.encode(name);
    input = input.concat(Array.from(encoded_name));

    // Transaction to call the flip() fn in the Flipper contract
    let transaction: Transaction = {
        from: Array.from(from),
        callee: Array.from(callee),
        selector: selector,
        input: input,
        transferredValue: transferredValue,
        gasLimit: gasLimit,
        allowReentry: allowReentry,
        nonce: nonce,
        expirationTimeSeconds: expirationTimeSeconds
    }

    let transaction_for_encoding = {
        from: from,
        callee: callee,
        selector: Uint8Array.from(selector),
        input: Uint8Array.from(input),
        transferredValue: BigInt(transferredValue),
        gasLimit: BigInt(gasLimit),
        allowReentry: transaction.allowReentry,
        nonce: BigInt(nonce),
        expirationTimeSeconds: BigInt(expirationTimeSeconds)
    }

    let encoded_transaction = $transaction_codec.encode(transaction_for_encoding);
    let signature = ecdsa_alice.sign(encoded_transaction);

    // Exec
    const { gasRequired } = await forwarder
      .withSigner(bob)
      .query.execute(transaction, Array.from(signature));
    
    await expect(
      forwarder.withSigner(bob).tx.execute(
          transaction, Array.from(signature), {
          gasLimit: gasRequired,
          value: 0,
      })
    ).to.eventually.be.fulfilled;

    expect(
      (await registry.query.getName(ecdsa_alice.address)).value.ok?.toString()
    ).to.be.equal(name);
  })
});
