use std::{fmt, str::FromStr};

use anyhow::{anyhow, Error};

pub mod model;
pub mod rpc;

#[derive(Debug, Clone, Copy, Eq, PartialEq)]
pub enum ContractState {
    Created,
    Deployed,
}

impl ContractState {
    pub fn as_i32(&self) -> i32 {
        match self {
            ContractState::Created => 0,
            ContractState::Deployed => 1,
        }
    }
    pub fn is_valid_transition(&self, newstate: &ContractState) -> bool {
        match self {
            ContractState::Created => !matches!(newstate, ContractState::Deployed),
            ContractState::Deployed => true,
        }
    }
}
impl fmt::Display for ContractState {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ContractState::Created => write!(f, "created"),
            ContractState::Deployed => write!(f, "deployed"),
        }
    }
}
impl FromStr for ContractState {
    type Err = Error;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "created" => Ok(ContractState::Created),
            "deployed" => Ok(ContractState::Deployed),
            _ => Err(anyhow!("could not parse ContractState from {}", s)),
        }
    }
}
