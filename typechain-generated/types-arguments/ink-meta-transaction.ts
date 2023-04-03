import type BN from 'bn.js';

export enum LangError {
	couldNotReadInput = 'CouldNotReadInput'
}

export type AccountId = string | number[]

export type Transaction = {
	callee: AccountId,
	selector: Array<(number | string | BN)>,
	input: Array<(number | string | BN)>,
	transferredValue: (string | number | BN),
	gasLimit: (number | string | BN),
	allowReentry: boolean,
	nonce: (string | number | BN),
	expirationTimeSeconds: (number | string | BN)
}

export enum Error {
	transactionFailed = 'TransactionFailed'
}

