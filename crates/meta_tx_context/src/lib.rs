#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

pub mod traits;

pub use traits::*;

use ink::prelude::vec::Vec;
use openbrush::{
    contracts::access_control::*,
    modifiers,
    traits::{
        AccountId,
        Storage,
    },
};

pub const MANAGER: RoleType = ink::selector_id!("MANAGER");

pub const STORAGE_KEY: u32 = openbrush::storage_unique_key!(MetaTxContextData);

#[derive(Default, Debug)]
#[openbrush::upgradeable_storage(STORAGE_KEY)]
pub struct Data {
    pub trusted_forwarder: Option<AccountId>,
}

impl<T> MetaTxContext for T
where
    T: Storage<Data> + Storage<access_control::Data>,
{
    default fn get_trusted_forwarder(&self) -> Option<AccountId> {
        self.data::<Data>().trusted_forwarder
    }

    #[modifiers(only_role(DEFAULT_ADMIN_ROLE))]
    default fn set_trusted_forwarder(
        &mut self,
        forwarder: AccountId,
    ) -> Result<(), AccessControlError> {
        self.data::<Data>().trusted_forwarder = Some(forwarder);
        Ok(())
    }

    default fn _caller(&self, data: Vec<u8>) -> Result<AccountId, Error> {
        let caller = Self::env().caller();
        if let Some(trusted_forwarder) = self.data::<Data>().trusted_forwarder {
            if caller == trusted_forwarder {
                return AccountId::try_from(data.as_slice())
                    .map_err(|_| Error::RecoverAccountIdFailed)
            }
        }
        Ok(caller)
    }
}
