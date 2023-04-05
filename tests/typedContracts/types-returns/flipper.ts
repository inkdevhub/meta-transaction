import type BN from 'bn.js';
import type {ReturnNumber} from '@727-ventures/typechain-types';

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

