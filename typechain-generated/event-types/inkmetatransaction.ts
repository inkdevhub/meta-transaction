import type {ReturnNumber} from "@727-ventures/typechain-types";
import type * as ReturnTypes from '../types-returns/inkmetatransaction';

export interface Executed {
	caller: ReturnTypes.AccountId;
	callee: ReturnTypes.AccountId;
	encodedTransaction: ReturnTypes.Transaction;
}

