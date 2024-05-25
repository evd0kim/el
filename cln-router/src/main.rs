use std::{collections::BTreeMap, sync::Arc};

use anyhow::{anyhow, Result};
use cln_plugin::{options, Builder};
use log::{debug, warn};
use parking_lot::Mutex;
use tokio::sync::broadcast;

mod hooks;
mod worker;

use cln_eth::model::PluginState;
use cln_eth::rpc::{
    erc20_withdraw, eth_withdraw, get_gas, redeem_erc20_htlc, refund_erc20_htlc, set_erc20_htlc,
    pay_redeem_erc20_htlc,
};

#[tokio::main]
async fn main() -> Result<(), anyhow::Error> {
    debug!("Starting Ethereum Virtual Machine plugin");
    std::env::set_var("CLN_PLUGIN_LOG", "debug");

    let (notification_sender, _) = broadcast::channel(1024);

    let state = PluginState {
        blockheight: Arc::new(Mutex::new(u32::default())),
        evminvoices: Arc::new(tokio::sync::Mutex::new(BTreeMap::new())),
        channel: notification_sender.clone(),
    };

    let plugin = if let Some(p) = Builder::new(tokio::io::stdin(), tokio::io::stdout())
        .option(options::ConfigOption::new(
            "eth-worker-sleep",
            options::Value::OptInteger,
            "ETH worker sleep option",
        ))
        .option(options::ConfigOption::new(
            "alchemy-token",
            options::Value::OptString,
            "Alchemy API token string for requesting smart-contract data",
        ))
        .option(options::ConfigOption::new(
            "etherscan-token",
            options::Value::OptString,
            "Etherscan API token string for requesting smart-contract data",
        ))
        .option(options::ConfigOption::new(
            "eth-network",
            options::Value::OptString,
            "Type of Ethereum network",
        ))
        .option(options::ConfigOption::new(
            "eth-seed",
            options::Value::OptString,
            "Wallet seed",
        ))
        .option(options::ConfigOption::new(
            "eth-erc20",
            options::Value::OptString,
            "ERC20 token contract address",
        ))
        .option(options::ConfigOption::new(
            "htlc-erc20",
            options::Value::OptString,
            "Hashed Timelock ERC20 token contract address",
        ))
        .option(options::ConfigOption::new(
            "htlc-timelock",
            options::Value::OptInteger,
            "ERC20 HTLC contract timelock",
        ))
        .option(options::ConfigOption::new(
            "eth-limit",
            options::Value::OptInteger,
            "ETH token withdtawal limit",
        ))
        .option(options::ConfigOption::new(
            "erc20-limit",
            options::Value::OptInteger,
            "ERC20 token withdtawal limit",
        ))
        .option(options::ConfigOption::new(
            "eth-event-callback",
            options::Value::OptString,
            "Callback URI for submitting network events",
        ))
        .rpcmethod(
            "ethwithdraw",
            "creates, signs and submits onchain ETH transaction",
            eth_withdraw,
        )
        .rpcmethod(
            "erc20withdraw",
            "creates, signs and submits onchain ERC20 transaction",
            erc20_withdraw,
        )
        .rpcmethod(
            "seterc20htlc",
            "creates, signs and submits onchain ERC20 transaction",
            set_erc20_htlc,
        )
        .rpcmethod(
            "redeemerc20htlc",
            "redeems ERC20 tokens from HTLC contract",
            redeem_erc20_htlc,
        )
        .rpcmethod(
            "refunderc20htlc",
            "redeems ERC20 tokens from HTLC contract",
            refund_erc20_htlc,
        )
        .rpcmethod(
            "payredeemerc20htlc",
            "pays an invoice and redeems ERC20 tokens from HTLC contract",
            pay_redeem_erc20_htlc,
        )
        .rpcmethod("gas", "get gas price estimation", get_gas)
        .hook("htlc_accepted", hooks::dummy_handler)
        .subscribe("block_added", hooks::block_added)
        .configure()
        .await?
    {
        p
    } else {
        return Ok(());
    };

    if let Ok(plugin) = plugin.start(state).await {
        let pcloned = plugin.clone();
        tokio::spawn(async move {
            match worker::eth(pcloned, notification_sender.clone()).await {
                Ok(()) => (),
                Err(e) => warn!(
                    "Error in Ethereum Virtual Machine worker: {}",
                    e.to_string()
                ),
            };
        });
        let pcloned = plugin.clone();
        tokio::spawn(async move {
            match worker::run(pcloned).await {
                Ok(()) => (),
                Err(e) => warn!("Error in Generic worker: {}", e.to_string()),
            };
        });
        plugin.join().await
    } else {
        Err(anyhow!("Error starting the plugin!"))
    }
}
