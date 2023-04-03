import type BN from 'bn.js';
import type {ReturnNumber} from '@727-ventures/typechain-types';

export enum LangError {
	couldNotReadInput = 'CouldNotReadInput'
}

export type AccountId = string | number[]

export type Transaction = {
	callee: AccountId,
	selector: Array<number>,
	input: Array<number>,
	transferredValue: ReturnNumber,
	gasLimit: number,
	allowReentry: boolean,
	nonce: ReturnNumber,
	expirationTimeSeconds: number
}

export enum Error {
	transactionFailed = 'TransactionFailed'
}

