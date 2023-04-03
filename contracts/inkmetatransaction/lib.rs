#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
mod inkmetatransaction {
    use ink::env::{
        call::{build_call, ExecutionInput},
        CallFlags,
    };
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;
    use scale::{Encode, Output};

    pub type Nonce = u128;

    #[derive(scale::Decode, scale::Encode, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(
            Debug,
            PartialEq,
            Eq,
            scale_info::TypeInfo,
            ink::storage::traits::StorageLayout
        )
    )]
    pub struct Transaction {
        /// The creator of the transaction. Should be the signer.
        pub from: AccountId,
        /// The `AccountId` of the contract that is called in this transaction.
        pub callee: AccountId,
        /// The selector bytes that identifies the function of the callee that should be called.
        pub selector: [u8; 4],
        /// The SCALE encoded parameters that are passed to the called function.
        pub input: Vec<u8>,
        /// The amount of chain balance that is transferred to the callee.
        pub transferred_value: Balance,
        /// Gas limit for the execution of the call.
        pub gas_limit: u64,
        /// If set to true the transaction will be allowed to re-enter the multisig contract.
        /// Re-entrancy can lead to vulnerabilities. Use at your own risk.
        pub allow_reentry: bool,
        /// Submitted nonce. Must match what is expected on-chain or transaction is invalid.
        pub nonce: Nonce,
        /// Transaction must be executed before this deadline or it becomes invalid
        pub expiration_time_seconds: Timestamp,
    }

    /// A wrapper that allows us to encode a blob of bytes.
    ///
    /// We use this to pass the set of untyped (bytes) parameters to the `CallBuilder`.
    struct CallInput<'a>(&'a [u8]);

    impl<'a> scale::Encode for CallInput<'a> {
        fn encode_to<T: Output + ?Sized>(&self, dest: &mut T) {
            dest.write(self.0);
        }
    }

    /// A meta-transaction was executed
    #[ink(event)]
    pub struct Executed {
        #[ink(topic)]
        caller: AccountId,
        #[ink(topic)]
        callee: AccountId,
        encoded_transaction: Transaction,
    }

    /// Errors that can occur upon calling this contract.
    #[derive(Copy, Clone, Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(::scale_info::TypeInfo))]
    pub enum Error {
        /// Signature does not match transaction
        BadSignature,
        /// Returned if the call failed.
        TransactionFailed,
        /// Token amount specified in transaction did not match tokens sent with `execute()` call
        ValueTransferMismatch,
        /// Transaction submitted cannot be executed after it has expired (transaction.expiration_time_seconds)
        TransactionExpired,
        // Submitted nonce does match expected
        IncorrectNonce,
        // Signature does not match transaction
        IncorrectSignature,
    }

    #[ink(storage)]
    pub struct InkMetaTransaction {
        /// Not a 256 bit integer as in the solidity version, but putting highest rust integer for now
        nonces: Mapping<AccountId, Nonce>,
    }

    impl InkMetaTransaction {
        #[ink(constructor)]
        pub fn default() -> Self {
            Self {
                nonces: Mapping::default(),
            }
        }

        /// Get the nonce for the given account
        #[ink(message)]
        pub fn get_nonce(&self, address: AccountId) -> Nonce {
            self.nonces.get(address).unwrap_or(0 as Nonce)
        }

        /// Verifies that a transaction matches its supplied signature.
        #[ink(message)]
        pub fn verfiy(&self, req: Transaction, signature: [u8; 65]) -> Result<(), Error> {
            ink::env::debug_println!("req.callee: {:?}", req.callee);

            let encoded_msg: Vec<u8> = req.encode();
            ink::env::debug_println!("Encoded message Vec<u8>: {:?}", encoded_msg);
            // let message_hash = Keccak256::digest(encoded_msg).to_vec();
            let message_hash = Self::blake2x256_hash(encoded_msg);
            ink::env::debug_println!("32 byte message hash: {:?}", message_hash);

            match self.env().ecdsa_recover(&signature, &message_hash) {
                Ok(pub_key) => {
                    // Match recovered pub_key with caller
                    let caller = req.from;
                    let signer = Self::to_default_account_id(pub_key);

                    ink::env::debug_println!(
                        "pub key: {:?}\ncaller: {:?}\nsigner: {:?}",
                        pub_key,
                        caller,
                        signer
                    );

                    let expected_nonce = self.get_nonce(caller);

                    // Is the message signed by the same account that sent it?
                    // And does the transacation have the expected nonce?
                    if expected_nonce != req.nonce {
                        return Err(Error::IncorrectNonce);
                    }
                    if signer != caller {
                        return Err(Error::IncorrectSignature);
                    } else {
                        ink::env::debug_println!(
                            "MATCH\nCaller {:?}\nSigner: {:?}",
                            caller,
                            signer,
                        );
                        return Ok(());
                    }
                }
                Err(_) => return Err(Error::IncorrectSignature),
            }
        }

        /// Call a meta transaction. The transaction calling this fn must contain a valid transaction inside it that is passed to this fn as `req`.
        /// `req` will be verified by `verify` using the supplied `signature`. If the transaction is signed correctly, it will be executed.
        #[ink(message, payable)]
        pub fn execute(&mut self, req: Transaction, signature: [u8; 65]) -> Result<(), Error> {
            // Signature must be correct
            let _ = self.verfiy(req.clone(), signature.clone());

            // Assert that the correct amount of tokens were sent to this contract instance with this fn call
            if self.env().transferred_value() != req.transferred_value {
                return Err(Error::ValueTransferMismatch);
            }

            // Assert that the transaction hasn't already expired
            if self.env().block_timestamp() >= req.expiration_time_seconds {
                return Err(Error::TransactionExpired);
            }

            let caller = req.from;
            let updated_nonce = self.get_nonce(caller) + 1;

            // Signature is valid, so increase nonce and then execute transaction
            self.nonces.insert(caller, &updated_nonce);

            // Run the transaction
            let result = build_call::<<Self as ::ink::env::ContractEnv>::Env>()
                .call(req.callee)
                .gas_limit(req.gas_limit)
                .transferred_value(req.transferred_value)
                .call_flags(CallFlags::default().set_allow_reentry(req.allow_reentry))
                .exec_input(
                    ExecutionInput::new(req.selector.into()).push_arg(CallInput(&req.input)),
                )
                .returns::<()>()
                .try_invoke();

            match result {
                Ok(Ok(_)) => {
                    self.env().emit_event(Executed {
                        caller: caller,
                        callee: req.callee,
                        encoded_transaction: req,
                    });
                    return Ok(());
                }
                Err(e) => {
                    ink::env::debug_println!("Transaction error: {:?}", e);
                    return Err(Error::TransactionFailed);
                }
                _ => return Err(Error::TransactionFailed),
            };
        }

        /// Convert a compressed 33 byte ECDSA public key into a 32 byte Substrate address
        fn to_default_account_id(compressed_pub_key: [u8; 33]) -> ink::primitives::AccountId {
            use ink::env::hash;

            let mut output = <hash::Blake2x256 as hash::HashOutput>::Type::default();
            ink::env::hash_bytes::<hash::Blake2x256>(&compressed_pub_key[..], &mut output);

            output.into()
        }

        /// Compute the 32 byte Blake 256 hash of the supplied byte vector.
        fn blake2x256_hash(bytes: Vec<u8>) -> [u8; 32] {
            use ink::env::hash;

            let mut output = <hash::Blake2x256 as hash::HashOutput>::Type::default();
            ink::env::hash_bytes::<hash::Blake2x256>(&bytes[..], &mut output);

            output
        }
    }

    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// We test if the default constructor does its job.
        #[ink::test]
        fn default_works() {
            let meta_transaction = InkMetaTransaction::default();
            assert_eq!(meta_transaction.get_nonce(AccountId::from([0u8; 32])), 0);
            assert_eq!(meta_transaction.get_nonce(AccountId::from([1u8; 32])), 0);
        }
    }
}
