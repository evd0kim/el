use serde::{Deserialize, Serialize};
use std::{
    collections::{BTreeMap, HashMap},
    sync::Arc,
};
use tokio::sync::broadcast::Sender;

use cln_rpc::model::responses::ListinvoicesInvoices;
use parking_lot::Mutex;


use ethers::types::{Address, U256};

#[derive(Clone, Debug)]
pub struct Contract {
    /*
    contracts[contractId] = LockContract(
    msg.sender,
    _receiver,
    _tokenContract,
    _amount,
    _hashlock,
    _timelock,
    false,
    false,
    0x0
    );
    */
    pub sender: String,
    pub receiver: String,
    pub tokenContract: String,
    pub hashlock: String,
    pub timelock: String,
    pub amount: u64,
    pub expiry: u32,
    pub loop_mutex: Arc<tokio::sync::Mutex<bool>>,
}

#[derive(Clone, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ContractId {
    pub address: String,
    pub htlc_id: u64,
}

#[derive(Clone, Debug)]
pub struct EVMInvoice {
    pub state: Contract,
    pub generation: u64,
    pub evm_data: HashMap<ContractId, Contract>,
    pub invoice: ListinvoicesInvoices,
}

#[derive(Clone, Debug)]
pub struct PluginState {
    pub blockheight: Arc<Mutex<u32>>,
    pub evminvoices: Arc<tokio::sync::Mutex<BTreeMap<String, EVMInvoice>>>,
    pub channel: Sender<Notification>,
}

#[derive(Clone, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Withdraw {
    pub address: Address,
    // ETH native amounts
    pub amount: U256,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct WithdrawERC20 {
    pub address: Address,
    // Token native amounts
    pub token_amount: u64,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ERC20IncomingHTLC {
    pub receiver: Address,
    pub hashlock: Vec<u8>,
    pub token: Address,
    pub token_amount: u64,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ERC20RefundHTLC {
    pub hashlock: Vec<u8>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ERC20RedeemHTLC {
    pub hashlock: Vec<u8>,
    pub preimage: Vec<u8>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ERC20PayAndRedeemHTLC {
    pub hashlock: Vec<u8>,
    pub invoice_msat: u64,
    pub bolt11: String,
}

pub type GasPrice = U256;

/// Used to send messages via broadcast channel to outside workers
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum Notification {
    NewContract(ContractId),
    Withdraw(Withdraw),
    WithdrawERC20(WithdrawERC20),
    ERC20IncomingHTLC(ERC20IncomingHTLC),
    ERC20RefundHTLC(ERC20RefundHTLC),
    ERC20RedeemHTLC(ERC20RedeemHTLC),
    ERC20PayAndRedeemHTLC(ERC20PayAndRedeemHTLC),
    GasPrice(GasPrice),
}
