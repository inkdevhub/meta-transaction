import type BN from 'bn.js';

export type AccountId = string | number[]

export enum LangError {
	couldNotReadInput = 'CouldNotReadInput'
}

export interface Error {
	nameTaken ? : null,
	alreadyRegistered ? : null,
	nameNotRegistered ? : null,
	metaTxContextError ? : Error
}

export class ErrorBuilder {
	static NameTaken(): Error {
		return {
			nameTaken: null,
		};
	}
	static AlreadyRegistered(): Error {
		return {
			alreadyRegistered: null,
		};
	}
	static NameNotRegistered(): Error {
		return {
			nameNotRegistered: null,
		};
	}
	static MetaTxContextError(value: Error): Error {
		return {
			metaTxContextError: value,
		};
	}
}

export enum Error {
	recoverAccountIdFailed = 'RecoverAccountIdFailed'
}

