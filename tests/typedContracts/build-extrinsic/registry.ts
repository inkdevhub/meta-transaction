/* This file is auto-generated */

import type { ContractPromise } from '@polkadot/api-contract';
import type { GasLimit, GasLimitAndRequiredValue } from '@727-ventures/typechain-types';
import { buildSubmittableExtrinsic } from '@727-ventures/typechain-types';
import type * as ArgumentTypes from '../types-arguments/registry';
import type BN from 'bn.js';
import type { ApiPromise } from '@polkadot/api';



export default class Methods {
	private __nativeContract : ContractPromise;
	private __apiPromise: ApiPromise;

	constructor(
		nativeContract : ContractPromise,
		apiPromise: ApiPromise,
	) {
		this.__nativeContract = nativeContract;
		this.__apiPromise = apiPromise;
	}
	/**
	 * register
	 *
	 * @param { string } name,
	 * @param { Array<(number | string | BN)> } data,
	*/
	"register" (
		name: string,
		data: Array<(number | string | BN)>,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "register", [name, data], __options);
	}

	/**
	 * unregister
	 *
	 * @param { Array<(number | string | BN)> } data,
	*/
	"unregister" (
		data: Array<(number | string | BN)>,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "unregister", [data], __options);
	}

	/**
	 * getName
	 *
	 * @param { ArgumentTypes.AccountId } accountId,
	*/
	"getName" (
		accountId: ArgumentTypes.AccountId,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "getName", [accountId], __options);
	}

	/**
	 * getOwner
	 *
	 * @param { string } name,
	*/
	"getOwner" (
		name: string,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "getOwner", [name], __options);
	}

}