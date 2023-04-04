use openbrush::{
    traits::AccountId,
};
use ink::prelude::vec::Vec;
use openbrush::contracts::access_control::*;
use core::array::TryFromSliceError;

#[openbrush::wrapper]
pub type MetaTxContextRef = dyn MetaTxContext;

#[openbrush::trait_definition]
pub trait MetaTxContext {
    #[ink(message)]
    fn get_trusted_forwarder(&self) -> Option<AccountId>;

    #[ink(message)]
    fn set_trusted_forwarder(&mut self, forwarder: AccountId) -> Result<(), AccessControlError>;

    fn _caller(&self, data: Vec<u8>) -> Result<AccountId, Error>;
}

impl From<TryFromSliceError> for Error {
    fn from(_: TryFromSliceError) -> Self {
        Error::RecoverAccountIdFailed
    }
}

/// Errors that can occur upon calling this contract.
#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(::scale_info::TypeInfo))]
pub enum Error {
    RecoverAccountIdFailed,
}
