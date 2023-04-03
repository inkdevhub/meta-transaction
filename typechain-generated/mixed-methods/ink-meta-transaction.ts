/* This file is auto-generated */

import type { ContractPromise } from '@polkadot/api-contract';
import type { ApiPromise } from '@polkadot/api';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { GasLimit, GasLimitAndRequiredValue, Result } from '@727-ventures/typechain-types';
import type { QueryReturnType } from '@727-ventures/typechain-types';
import { queryOkJSON, queryJSON, handleReturnType } from '@727-ventures/typechain-types';
import { txSignAndSend } from '@727-ventures/typechain-types';
import type * as ArgumentTypes from '../types-arguments/ink-meta-transaction';
import type * as ReturnTypes from '../types-returns/ink-meta-transaction';
import type BN from 'bn.js';
//@ts-ignore
import {ReturnNumber} from '@727-ventures/typechain-types';
import {getTypeDescription} from './../shared/utils';
// @ts-ignore
import type {EventRecord} from "@polkadot/api/submittable";
import {decodeEvents} from "../shared/utils";


export default class Methods {
	private __nativeContract : ContractPromise;
	private __keyringPair : KeyringPair;
	private __callerAddress : string;
	private __apiPromise: ApiPromise;

	constructor(
		apiPromise : ApiPromise,
		nativeContract : ContractPromise,
		keyringPair : KeyringPair,
	) {
		this.__apiPromise = apiPromise;
		this.__nativeContract = nativeContract;
		this.__keyringPair = keyringPair;
		this.__callerAddress = keyringPair.address;
	}

	/**
	* getNonce
	*
	* @param { ArgumentTypes.AccountId } address,
	* @returns { Result<ReturnNumber, ReturnTypes.LangError> }
	*/
	"getNonce" (
		address: ArgumentTypes.AccountId,
		__options: GasLimit,
	): Promise< QueryReturnType< Result<ReturnNumber, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "getNonce", [address], __options, (result) => { return handleReturnType(result, getTypeDescription(7, 'ink-meta-transaction')); });
	}

	/**
	* verfiy
	*
	* @param { ArgumentTypes.Transaction } req,
	* @param { Array<(number | string | BN)> } signature,
	* @returns { Result<boolean, ReturnTypes.LangError> }
	*/
	"verfiy" (
		req: ArgumentTypes.Transaction,
		signature: Array<(number | string | BN)>,
		__options: GasLimit,
	): Promise< QueryReturnType< Result<boolean, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "verfiy", [req, signature], __options, (result) => { return handleReturnType(result, getTypeDescription(14, 'ink-meta-transaction')); });
	}

	/**
	* execute
	*
	* @param { ArgumentTypes.Transaction } req,
	* @param { Array<(number | string | BN)> } signature,
	* @returns { void }
	*/
	"execute" (
		req: ArgumentTypes.Transaction,
		signature: Array<(number | string | BN)>,
		__options: GasLimitAndRequiredValue,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "execute", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, "ink-meta-transaction");
		}, [req, signature], __options);
	}

}