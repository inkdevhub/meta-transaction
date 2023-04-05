import type BN from 'bn.js';

export type AccountId = string | number[]

export enum LangError {
	couldNotReadInput = 'CouldNotReadInput'
}

export interface Error {
	metaTxContextError ? : Error
}

export class ErrorBuilder {
	static MetaTxContextError(value: Error): Error {
		return {
			metaTxContextError: value,
		};
	}
}

export enum Error {
	recoverAccountIdFailed = 'RecoverAccountIdFailed'
}

