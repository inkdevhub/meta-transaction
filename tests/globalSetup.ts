import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { mnemonicGenerate } from '@polkadot/util-crypto';
import InkMetaConstructor from "../typechain-generated/constructors/inkmetatransaction";
import InkMetaContract from "../typechain-generated/contracts/inkmetatransaction";
import FlipperConstructor from "../typechain-generated/constructors/flipper";
import FlipperContract from "../typechain-generated/contracts/flipper";
import { Transaction } from "../typechain-generated/types-arguments/inkmetatransaction";
import Web3 from "web3";
import { Result } from '@727-ventures/typechain-types';

// Create a new instance of contract
const wsProvider = new WsProvider('ws://127.0.0.1:9944');
// Create a keyring instance
const keyring = new Keyring({ type: 'ecdsa' });
// const mnemonic = "tower rail then giggle pulp dry donate action dad any bind kit";
export default async function setupApi(): Promise<void> {
    const api = await ApiPromise.create({ provider: wsProvider });

    // console.log(`mnemonic: ${mnemonic}`);
    // const bob = keyring.addFromUri(mnemonic, { name: 'Bob' }, 'ethereum');
    const alice = keyring.addFromUri('//Alice');
    const bob = keyring.addFromUri('//Bob');



    globalThis.setup = { api, keyring, alice, bob };
}