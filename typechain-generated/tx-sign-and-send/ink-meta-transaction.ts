/* This file is auto-generated */

import type { ContractPromise } from '@polkadot/api-contract';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { ApiPromise } from '@polkadot/api';
import type { GasLimit, GasLimitAndRequiredValue, Result } from '@727-ventures/typechain-types';
import { txSignAndSend } from '@727-ventures/typechain-types';
import type * as ArgumentTypes from '../types-arguments/ink-meta-transaction';
import type BN from 'bn.js';
// @ts-ignore
import type {EventRecord} from "@polkadot/api/submittable";
import {decodeEvents} from "../shared/utils";


export default class Methods {
	private __nativeContract : ContractPromise;
	private __keyringPair : KeyringPair;
	private __apiPromise: ApiPromise;

	constructor(
		apiPromise: ApiPromise,
		nativeContract : ContractPromise,
		keyringPair : KeyringPair,
	) {
		this.__apiPromise = apiPromise;
		this.__nativeContract = nativeContract;
		this.__keyringPair = keyringPair;
	}

	/**
	* getNonce
	*
	* @param { ArgumentTypes.AccountId } address,
	*/
	"getNonce" (
		address: ArgumentTypes.AccountId,
		__options ? : GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "getNonce", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, "ink-meta-transaction");
		}, [address], __options);
	}

	/**
	* verfiy
	*
	* @param { ArgumentTypes.Transaction } req,
	* @param { Array<(number | string | BN)> } signature,
	*/
	"verfiy" (
		req: ArgumentTypes.Transaction,
		signature: Array<(number | string | BN)>,
		__options ? : GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "verfiy", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, "ink-meta-transaction");
		}, [req, signature], __options);
	}

	/**
	* execute
	*
	* @param { ArgumentTypes.Transaction } req,
	* @param { Array<(number | string | BN)> } signature,
	*/
	"execute" (
		req: ArgumentTypes.Transaction,
		signature: Array<(number | string | BN)>,
		__options ? : GasLimitAndRequiredValue,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "execute", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, "ink-meta-transaction");
		}, [req, signature], __options);
	}

}