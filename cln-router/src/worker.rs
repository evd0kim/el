use anyhow::Error;
use hex;
use log::{debug, error, info};

use std::time::{Duration, SystemTime, UNIX_EPOCH};
use std::{ops::Div, str::FromStr};
use tokio::sync::broadcast::Sender;
use tokio::time::timeout;
use tokio::time::{self};

use cln_eth::model::{Notification, PluginState};
use cln_eth::rpc::{make_rpc_path, pay_invoice};
use cln_plugin::Plugin;

use cln_rpc::{
    model::{requests::PayRequest, responses::PayResponse},
    ClnRpc, Request, Response,
};

use ethers::core::types::transaction::request::TransactionRequest;

use ethers::contract::{ContractError, EthError, LogMeta};

use ethers::prelude::{Middleware, Provider, Signer, SignerMiddleware};
use ethers::{
    contract::abigen,
    middleware::{gas_oracle::ProviderOracle, GasOracle},
    providers::{StreamExt, Ws},
    signers::{coins_bip39::English, MnemonicBuilder},
    types::{Address, I256, U256},
    utils::parse_units,
};
use std::sync::Arc;

use serde::Serialize;

use crate::worker::htlc_contract::Htlcerc20NewFilter;
use crate::worker::htlc_contract::Htlcerc20RefundFilter;
use crate::worker::htlc_contract::Htlcerc20WithdrawFilter;

abigen!(
    RouterContract,
    "./abi/Router.json",
    event_derives(serde::Deserialize, serde::Serialize)
);

#[derive(Serialize)]
pub enum HTLCEvent {
    Htlcerc20NewFilter(Htlcerc20NewFilter),
    Htlcerc20RefundFilter(Htlcerc20RefundFilter),
    Htlcerc20WithdrawFilter(Htlcerc20WithdrawFilter),
    RouterContractError(RouterContractError),
}

#[derive(Serialize)]
pub struct RouterContractError {
    address: String,
    receiver: String,
    hashlock: String,
    message: String,
}

#[derive(Serialize)]
pub struct SubmitEvent {
    meta: Option<LogMeta>,
    event: String,
    data: HTLCEvent,
}

pub async fn run(plugin: Plugin<PluginState>) -> Result<(), Error> {
    time::sleep(Duration::from_secs(3)).await;
    info!("Starting contract event listener task");
    debug!("Reading plugin options");
    let sleep_time = match plugin.option("eth-worker-sleep") {
        Some(v) => v.as_i64().unwrap().to_owned() as u64,
        _ => return Err(std::fmt::Error.into()),
    };
    let htlc = match plugin.option("htlc-erc20") {
        Some(v) => v.as_str().unwrap().to_owned(),
        _ => return Err(std::fmt::Error.into()),
    };
    let network = match plugin.option("eth-network") {
        Some(v) => v.as_str().unwrap().to_owned(),
        _ => return Err(std::fmt::Error.into()),
    };
    let alchemy = match plugin.option("alchemy-token") {
        Some(v) => v.as_str().unwrap().to_owned(),
        _ => return Err(std::fmt::Error.into()),
    };
    let event_callback = match plugin.option("eth-event-callback") {
        Some(v) => v.as_str().unwrap().to_owned(),
        _ => return Err(std::fmt::Error.into()),
    };
    let rpc_url = format!("wss://eth-{network}.g.alchemy.com/v2/{alchemy}");

    let provider = Provider::<Ws>::connect(rpc_url).await?;
    let chain_id = provider.get_chainid().await?;
    let block_number = provider.get_block_number().await?;
    debug!("Listener created Ethereum node RPC provider Alchemy: chain {chain_id} / block {block_number}");
    let client = Arc::new(provider);
    let htlc_address = Address::from_str(htlc.as_str()).unwrap();
    let htlc = RouterContract::new(htlc_address, client.clone());
    let events = htlc.events().from_block(9876699);

    // callback requests
    let client = reqwest::Client::new();
    loop {
        let mut stream = events.stream().await?.with_meta().take(1);
        info!("Performing listener loop routine");
        match stream.next().await {
            Some(Ok((event, meta))) => {
                info!(
                    r#"address: {:?},
               block_number: {:?},
               block_hash: {:?},
               transaction_hash: {:?},
               transaction_index: {:?},
               log_index: {:?}
            "#,
                    meta.address,
                    meta.block_number,
                    meta.block_hash,
                    meta.transaction_hash,
                    meta.transaction_index,
                    meta.log_index
                );
                info!("Filtering event");
                let event_data = match event.clone() {
                    RouterContractEvents::Htlcerc20NewFilter(f) => {
                        debug!("{f:?}");
                        SubmitEvent {
                            meta: Some(meta),
                            event: "new".to_string(),
                            data: HTLCEvent::Htlcerc20NewFilter(f),
                        }
                    }
                    RouterContractEvents::Htlcerc20RefundFilter(f) => {
                        debug!("{f:?}");
                        SubmitEvent {
                            meta: Some(meta),
                            event: "refund".to_string(),
                            data: HTLCEvent::Htlcerc20RefundFilter(f),
                        }
                    }
                    RouterContractEvents::Htlcerc20WithdrawFilter(f) => {
                        debug!("{f:?}");
                        SubmitEvent {
                            meta: Some(meta),
                            event: "withdraw".to_string(),
                            data: HTLCEvent::Htlcerc20WithdrawFilter(f),
                        }
                    }
                };

                match client
                    .post(event_callback.clone())
                    .json(&event_data)
                    .send()
                    .await
                {
                    Ok(res) => {
                        debug!("Status: {}", res.status());
                        debug!("Headers:\n{:#?}", res.headers());
                        // Read the response body as text/string if needed
                        match res.text().await {
                            Ok(body) => debug!("Body:\n{}", body),
                            Err(e) => error!("Couldnt decode resonse: {e:?}"),
                        }
                    }
                    Err(e) => error!("Couldnt send notification: {e:?}"),
                };
            }
            _ => {}
        };
        info!("Listener sleeps");
        time::sleep(Duration::from_secs(sleep_time)).await;
    }
}

pub async fn eth(
    plugin: Plugin<PluginState>,
    notification_sender: Sender<Notification>,
) -> Result<(), Error> {
    let mut notification_receiver = notification_sender.subscribe();
    debug!("Subscribed to notifications, sleep for 7 sec...");
    time::sleep(Duration::from_secs(7)).await;
    debug!("Reading plugin options");
    let sleep_time = match plugin.option("eth-worker-sleep") {
        Some(v) => v.as_i64().unwrap().to_owned() as u64,
        _ => return Err(std::fmt::Error.into()),
    };
    let phrase = match plugin.option("eth-seed") {
        Some(v) => v.as_str().unwrap().to_owned(),
        _ => return Err(std::fmt::Error.into()),
    };
    let erc20 = match plugin.option("eth-erc20") {
        Some(v) => v.as_str().unwrap().to_owned(),
        _ => return Err(std::fmt::Error.into()),
    };
    let htlc = match plugin.option("htlc-erc20") {
        Some(v) => v.as_str().unwrap().to_owned(),
        _ => return Err(std::fmt::Error.into()),
    };
    let timelock_sec = match plugin.option("htlc-timelock") {
        Some(v) => v.as_i64().unwrap().to_owned(),
        _ => return Err(std::fmt::Error.into()),
    };
    let network = match plugin.option("eth-network") {
        Some(v) => v.as_str().unwrap().to_owned(),
        _ => return Err(std::fmt::Error.into()),
    };
    let alchemy = match plugin.option("alchemy-token") {
        Some(v) => v.as_str().unwrap().to_owned(),
        _ => return Err(std::fmt::Error.into()),
    };
    let _event_callback = match plugin.option("eth-event-callback") {
        Some(v) => v.as_str().unwrap().to_owned(),
        _ => return Err(std::fmt::Error.into()),
    };
    let event_callback = match plugin.option("eth-event-callback") {
        Some(v) => v.as_str().unwrap().to_owned(),
        _ => return Err(std::fmt::Error.into()),
    };
    debug!(
        "Creating a wallet, ERC20 to track {} / {}",
        erc20.clone(),
        network.clone()
    );
    let wallet = MnemonicBuilder::<English>::default()
        .phrase(phrase.as_str())
        .derivation_path("m/44'/60'/0'/0/0")?
        // Use this if your mnemonic is encrypted
        .build()?;
    info!("Starting Ethereum worker with wallet {wallet:?}. Subscribed for updates in {network}");
    let rpc_url = format!("https://eth-{network}.g.alchemy.com/v2/{alchemy}");
    let provider = Provider::try_from(rpc_url)?;
    let chain_id = provider.get_chainid().await?;
    let block_number = provider.get_block_number().await?;
    debug!("Worker created Ethereum node RPC provider Alchemy: chain {chain_id} / block {block_number}");
    //let client = SignerMiddleware::new(provider.clone(), wallet.clone());
    let client = Arc::new(
        SignerMiddleware::new_with_provider_chain(provider.clone(), wallet.clone())
            .await
            .unwrap(),
    );
    // 1. Generate the ABI for the ERC20 contract. This is will define an `ERC20Contract` struct in
    // this scope that will let us call the methods of the contract.
    abigen!(ERC20Contract, "./abi/erc20.json",);
    // 2. Create the contract instance to let us call methods of the contract and let it sign
    // transactions with the sender wallet.
    let erc20_address = Address::from_str(erc20.as_str()).unwrap();
    let contract = ERC20Contract::new(erc20_address, client.clone());
    let decimals = contract.decimals().call().await?;
    debug!("Ethereum ERC20 contract {erc20} info: {decimals} decimals");

    let htlc_address = Address::from_str(htlc.as_str()).unwrap();
    debug!("HTLC ERC20 contract {htlc}");
    let htlc = RouterContract::new(htlc_address, client.clone());
    let events = htlc.events().from_block(16232696);
    let _stream = events.stream().await?.take(1);
    // callback requests
    let cb_client = reqwest::Client::new();
    loop {
        let cln_address = wallet.address();
        let balance = match contract.balance_of(cln_address).call().await {
            Ok(b) => b,
            Err(e) => {
                error!( "Connection issue on obtaining balance. Error {}, proceeding...", e);
                time::sleep(Duration::from_secs(sleep_time)).await;
                continue
            }
        };
        let oracle = ProviderOracle::new(provider.clone());
        let nonce = match provider.get_transaction_count(cln_address, None).await {
            Ok(n) => n,
            Err(e) => {
                error!( "Connection issue on getting nonce. Error {}, proceeding...", e);
                time::sleep(Duration::from_secs(sleep_time)).await;
                continue
            }
        };
        debug!(
            "Token {:?} balance {}, wallet nonce {}",
            erc20_address, balance, nonce
        );
        match timeout(Duration::from_secs((2*sleep_time) as u64), notification_receiver.recv()).await {
            Ok(Ok(Notification::NewContract(_cid))) => {
                info!("received new EVMInvoice");
            }
            Ok(Ok(Notification::Withdraw(w))) => {
                info!(
                    "Received Withdraw request to {} / {}, from {} / {}",
                    w.address, w.amount, cln_address, balance
                );
                // craft the transaction
                let tx = TransactionRequest::new()
                    .from(cln_address)
                    .to(w.address)
                    .value(w.amount);
                // send it!
                let pending_tx = match client.send_transaction(tx, None).await {
                    Ok(tx) => tx,
                    Err(e) => {
                        error!("Sending transaction failed due to {}", e);
                        continue
                    }
                } ;
                // get the mined tx
                let receipt = pending_tx
                    .await?
                    .ok_or_else(|| error!("Tx dropped from mempool"));
                match receipt {
                    Ok(r) => {
                        let tx = match client.get_transaction(r.transaction_hash).await {
                            Ok(tx) => tx,
                            Err(e) => {
                                error!("Cant get transaction due to {}", e);
                                continue
                            }
                        } ;
                        // TODO: fees & look into Receipt data structure for something useful
                        info!("Sent tx: {}", r.transaction_hash);
                        debug!("Raw tx: {}\n", serde_json::to_string(&tx)?);
                        debug!("Full receipt: {}", serde_json::to_string(&r)?);
                    }
                    _ => error!("Couldn't send transaction"),
                }
            }
            Ok(Ok(Notification::WithdrawERC20(w))) => {
                info!(
                    "Received WithdrawERC20 request to {} / {} - {}, from {} / {}",
                    w.address, w.token_amount, erc20, cln_address, balance
                );

                // 3. Fetch the decimals used by the contract so we can compute the decimal amount to send.
                let base = U256::from(10).pow(8.into()); // 100M sats
                let amount_sats =
                    U256::from(w.token_amount.clone()) * U256::exp10(decimals as usize);
                let amount_erc20 = amount_sats.div(base); // We divide by sats amount to get BTC
                info!(
                    "Converted native {} to U256 {}",
                    w.token_amount, amount_erc20
                );
                // 4. Transfer the desired amount of tokens to the `to_address`
                let tx = contract.transfer(w.address, amount_erc20);
                match tx.send().await {
                    Ok(pending_tx) => {
                        let receipt = pending_tx
                            .await?
                            .ok_or_else(|| error!("Tx dropped from mempool"));

                        match receipt {
                            Ok(r) => {
                                let tx = match client.get_transaction(r.transaction_hash).await {
                                    Ok(tx) => tx,
                                    Err(e) => {
                                        error!("Cant get transaction due to {}", e);
                                        continue
                                    }
                                } ;
                                // TODO: fees & look into Receipt data structure for something useful
                                info!("Sent tx: {}", r.transaction_hash);
                                debug!("Raw tx: {}\n", serde_json::to_string(&tx)?);
                                debug!("Full receipt: {}", serde_json::to_string(&r)?);
                                // 5. Fetch the balance of the recipient.
                                let balance = contract.balance_of(w.address).call().await?;
                                debug!("New balance: {}", balance);
                            }
                            _ => {
                                error!("Couldn't receipt of the transaction");
                                let _res = cb_client
                                    .post(event_callback.clone())
                                    .json(&SubmitEvent {
                                        meta: None,
                                        event: "error".to_string(),
                                        data: HTLCEvent::RouterContractError(RouterContractError {
                                            address: htlc_address.to_string(),
                                            receiver: w.address.to_string(),
                                            hashlock: "".to_string(),
                                            message: "No receipt received".to_string(),
                                        }),
                                    })
                                    .send()
                                    .await?;
                                continue;
                            }
                        }
                    }
                    Err(e) => match e {
                        ContractError::Revert(r) => {
                            let msg = String::decode_with_selector(&r).unwrap();
                            info!("Failed to withdraw from HTLC with {}", msg);
                            let _res = cb_client
                                .post(event_callback.clone())
                                .json(&SubmitEvent {
                                    meta: None,
                                    event: "error".to_string(),
                                    data: HTLCEvent::RouterContractError(RouterContractError {
                                        address: htlc_address.to_string(),
                                        receiver: w.address.to_string(),
                                        hashlock: "".to_string(),
                                        message: msg.clone(),
                                    }),
                                })
                                .send()
                                .await?;
                            continue;
                        }
                        _ => {}
                    },
                };
            }
            Ok(Ok(Notification::ERC20IncomingHTLC(h))) => {
                if erc20_address != h.token {
                    error!(
                        "Inconsistent contract addresses in plugin {} and provided externally {}",
                        erc20_address, h.token
                    );
                    continue;
                }
                info!(
                    "Received Incoming HTLC request to {} / {} - {}, from {} / {}",
                    h.receiver, h.token_amount, erc20, cln_address, balance
                );
                let base = U256::from(10).pow(8.into()); // 100M sats
                let amount_sats =
                    U256::from(h.token_amount.clone()) * U256::exp10(decimals as usize);
                let amount_erc20 = amount_sats.div(base); // We divide by sats amount to get BTC
                info!(
                    "Converted native {} to U256 {}",
                    h.token_amount, amount_erc20
                );
                // const timeLock1Hour = nowSeconds() + hourSeconds
                //let lock_date = Utc::now().naive_utc() + Duration::hours(1);
                //let lock_timestamp = lock_date.timestamp();
                let date_now = SystemTime::now();
                let now_timestamp = date_now
                    .duration_since(UNIX_EPOCH)
                    .expect("Time went backwards");
                let lock_timestamp = now_timestamp.as_secs() + timelock_sec as u64;
                let timelock = U256::from(lock_timestamp);

                let mut hashlock = [0u8; 32];
                hashlock.copy_from_slice(&h.hashlock);
                let hashlock_str = hex::encode(h.hashlock);
                // Checking if hashlock was already used
                let block_number = provider.get_block_number().await?;
                match htlc.contracts(hashlock).await {
                    Err(e) => error!(
                        "Unexpected error while requesting for contract state {:?}",
                        e
                    ),
                    Ok((_, r, ..)) => {
                        if r == Address::zero() {
                            info!("Hashlock check passed at {}", block_number);
                        } else {
                            error!("Hashlock reuse! Not allowed, rejecting {}", hashlock_str);
                            continue;
                        }
                    }
                };

                // newContract(receiver, hashlock, timelock, tokenContract, amount)
                let tx_approval = contract.approve(htlc_address, amount_erc20);
                match tx_approval.send().await {
                    Ok(pending_tx) => {
                        debug!("Approval confirmed. Checking onchain transaction...");
                        match pending_tx.await {
                            Ok(Some(r)) => {
                                let tx = match client.get_transaction(r.transaction_hash).await {
                                    Ok(tx) => tx,
                                    Err(e) => {
                                        error!("Cant get transaction due to {}", e);
                                        continue
                                    }
                                } ;
                                // TODO: fees & look into Receipt data structure for something useful
                                info!("Sent tx: {}", r.transaction_hash);
                                debug!("Raw tx: {}\n", serde_json::to_string(&tx)?);
                                debug!("Full receipt: {}", serde_json::to_string(&r)?);
                                // 5. Fetch the balance of the recipient.
                                let balance = contract.balance_of(h.receiver).call().await?;
                                debug!("New balance: {}", balance);
                            }
                            _ => error!("Faled to send transaction"),
                        }

                        let tx_htlc = htlc.new_contract(
                            h.receiver,
                            hashlock,
                            timelock,
                            h.token,
                            amount_erc20,
                        );

                        match tx_htlc.send().await {
                            Ok(pending_tx) => {
                                match pending_tx.await {
                                    Ok(Some(r)) => {
                                        let tx = match client.get_transaction(r.transaction_hash).await {
                                            Ok(tx) => tx,
                                            Err(e) => {
                                                error!("Cant get transaction due to {}", e);
                                                continue
                                            }
                                        } ;
                                        // TODO: fees & look into Receipt data structure for something useful
                                        info!("Sent tx: {}", r.transaction_hash);
                                        debug!("Raw tx: {}\n", serde_json::to_string(&tx)?);
                                        debug!("Full receipt: {}", serde_json::to_string(&r)?);
                                        // 5. Fetch the balance of the recipient.
                                        let balance =
                                            contract.balance_of(h.receiver).call().await?;
                                        debug!("New balance: {}", balance);
                                    }
                                    _ => {
                                        error!("Couldn't get receipt of the transaction");
                                        let _res = cb_client
                                            .post(event_callback.clone())
                                            .json(&SubmitEvent {
                                                meta: None,
                                                event: "error".to_string(),
                                                data: HTLCEvent::RouterContractError(
                                                    RouterContractError {
                                                        address: htlc_address.to_string(),
                                                        receiver: h.receiver.to_string(),
                                                        hashlock: hashlock_str,
                                                        message: "No receipt received".to_string(),
                                                    },
                                                ),
                                            })
                                            .send()
                                            .await?;
                                        continue;
                                    }
                                }
                            }
                            Err(e) => match e {
                                ContractError::Revert(r) => {
                                    let msg = String::decode_with_selector(&r).unwrap();
                                    info!(
                                        "Failed to create HTLC with {}. Hash {}",
                                        msg, hashlock_str
                                    );
                                    let _res = cb_client
                                        .post(event_callback.clone())
                                        .json(&SubmitEvent {
                                            meta: None,
                                            event: "error".to_string(),
                                            data: HTLCEvent::RouterContractError(RouterContractError {
                                                address: htlc_address.to_string(),
                                                receiver: h.receiver.to_string(),
                                                hashlock: hashlock_str,
                                                message: msg.clone(),
                                            }),
                                        })
                                        .send()
                                        .await?;
                                    continue;
                                }
                                _ => {}
                            },
                        };
                    }
                    _ => error!("Couldn't approve token spend"),
                };
            }
            Ok(Ok(Notification::ERC20RefundHTLC(n))) => {
                info!(
                    "Received Refund request to {}",
                    hex::encode(n.hashlock.clone())
                );
                let mut hashlock = [0u8; 32];
                hashlock.copy_from_slice(&n.hashlock);
                let hashlock_str = hex::encode(n.hashlock);
                // refund(contractId)
                let tx_htlc = htlc.refund(hashlock);
                match tx_htlc.send().await {
                    Ok(pending_tx) => {
                        let receipt = pending_tx
                            .await?
                            .ok_or_else(|| error!("Tx dropped from mempool"));
                        match receipt {
                            Ok(r) => {
                                let tx = match client.get_transaction(r.transaction_hash).await {
                                    Ok(tx) => tx,
                                    Err(e) => {
                                        error!("Cant get transaction due to {}", e);
                                        continue
                                    }
                                } ;
                                // TODO: fees & look into Receipt data structure for something useful
                                info!("Sent tx: {}", r.transaction_hash);
                                debug!("Raw tx: {}\n", serde_json::to_string(&tx)?);
                                debug!("Full receipt: {}", serde_json::to_string(&r)?);
                            }
                            _ => {
                                error!("Couldn't receipt of the transaction");
                                let _res = cb_client
                                    .post(event_callback.clone())
                                    .json(&SubmitEvent {
                                        meta: None,
                                        event: "error".to_string(),
                                        data: HTLCEvent::RouterContractError(RouterContractError {
                                            address: htlc_address.to_string(),
                                            receiver: "".to_string(),
                                            hashlock: hashlock_str,
                                            message: "No receipt received".to_string(),
                                        }),
                                    })
                                    .send()
                                    .await?;
                                continue;
                            }
                        }
                    }
                    Err(e) => match e {
                        ContractError::Revert(r) => {
                            let msg = String::decode_with_selector(&r).unwrap();
                            info!("Failed to refund HTLC with {}. Hash {}", msg, hashlock_str);
                            let _res = cb_client
                                .post(event_callback.clone())
                                .json(&SubmitEvent {
                                    meta: None,
                                    event: "error".to_string(),
                                    data: HTLCEvent::RouterContractError(RouterContractError {
                                        address: htlc_address.to_string(),
                                        receiver: "".to_string(),
                                        hashlock: hashlock_str,
                                        message: msg.clone(),
                                    }),
                                })
                                .send()
                                .await?;
                            continue;
                        }
                        _ => {}
                    },
                };
            }
            Ok(Ok(Notification::ERC20RedeemHTLC(n))) => {
                info!(
                    "Received Redeem request to {} preimage {}",
                    hex::encode(n.hashlock.clone()),
                    hex::encode(n.preimage.clone())
                );
                let mut hashlock = [0u8; 32];
                hashlock.copy_from_slice(&n.hashlock);
                let hashlock_str = hex::encode(n.hashlock);
                let mut preimage = [0u8; 32];
                preimage.copy_from_slice(&n.preimage);
                // redeem(contractId, preimage)
                let tx_htlc = htlc.withdraw(hashlock, preimage);
                match tx_htlc.send().await {
                    Ok(pending_tx) => {
                        let receipt = pending_tx
                            .await?
                            .ok_or_else(|| error!("Tx dropped from mempool"));
                        match receipt {
                            Ok(r) => {
                                let tx = match client.get_transaction(r.transaction_hash).await {
                                    Ok(tx) => tx,
                                    Err(e) => {
                                        error!("Cant get transaction due to {}", e);
                                        continue
                                    }
                                } ;
                                // TODO: fees & look into Receipt data structure for something useful
                                info!("Sent tx: {}", r.transaction_hash);
                                debug!("Raw tx: {}\n", serde_json::to_string(&tx)?);
                                debug!("Full receipt: {}", serde_json::to_string(&r)?);
                            }
                            _ => {
                                error!("Couldn't receipt of the transaction");
                                let _res = cb_client
                                    .post(event_callback.clone())
                                    .json(&SubmitEvent {
                                        meta: None,
                                        event: "error".to_string(),
                                        data: HTLCEvent::RouterContractError(RouterContractError {
                                            address: htlc_address.to_string(),
                                            receiver: "".to_string(),
                                            hashlock: hashlock_str,
                                            message: "No receipt received".to_string(),
                                        }),
                                    })
                                    .send()
                                    .await?;
                                continue;
                            }
                        }
                    }
                    Err(e) => match e {
                        ContractError::Revert(r) => {
                            let msg = String::decode_with_selector(&r).unwrap();
                            info!("Failed to redeem HTLC with {}. Hash {}", msg, hashlock_str);
                            let _res = cb_client
                                .post(event_callback.clone())
                                .json(&SubmitEvent {
                                    meta: None,
                                    event: "error".to_string(),
                                    data: HTLCEvent::RouterContractError(RouterContractError {
                                        address: htlc_address.to_string(),
                                        receiver: hex::encode(n.preimage),
                                        hashlock: hashlock_str,
                                        message: msg.clone(),
                                    }),
                                })
                                .send()
                                .await?;
                            continue;
                        }
                        _ => {}
                    },
                };
            }
            Ok(Ok(Notification::ERC20PayAndRedeemHTLC(n))) => {
                let block_number = provider.get_block_number().await?;
                let mut hashlock = [0u8; 32];
                hashlock.copy_from_slice(&n.hashlock);
                let hashlock_str = hex::encode(n.hashlock);
                info!("Received PayAndRedeem request for hash {} at {}", hashlock_str, block_number);
                let base = U256::from(10).pow(8.into()); // 100M sats
                let invoice_sat = n.invoice_msat.clone() / 1000 as u64;
                let amount_sats = U256::from(invoice_sat) * U256::exp10(decimals as usize);
                let amount_erc20 = amount_sats.div(base); // We divide by sats amount to get BTC
                info!(
                    "Converted native {} {} to U256 {}",
                    n.invoice_msat, invoice_sat, amount_erc20
                );
                match htlc.contracts(hashlock).await {
                    // (H160, H160, H160, ethers::types::U256, ethers::types::U256, bool, bool, [u8; 32])
                    Ok(outgoing_htlc) => {
                        let date_now = SystemTime::now();
                        let now_timestamp = date_now
                            .duration_since(UNIX_EPOCH)?.as_secs();
                        debug!("Received outgoing HTLC state {:?}", outgoing_htlc);
                        match outgoing_htlc {
                            (_, r, ..) if r != cln_address => {
                                error!("Receiver {} does not match CLN address {}", r, cln_address);
                            }
                            (_, _, t, ..) if t != erc20_address => {
                                error!(
                                    "Token contract {} does not match CLN setup {}",
                                    t, htlc_address
                                );
                            }
                            (_, _, _, a, ..) if a != amount_erc20 => {
                                error!(
                                    "Amount {} is not equal to provided in the invoice {}",
                                    a, amount_erc20
                                );
                            }
                            (_, _, _, _, ts, ..) if now_timestamp >= ts.as_u64() => {
                                error!("Timelock {} expired. Now {}", ts.as_u64(), now_timestamp);
                            }
                            (_, _, _, _, _, w, r, ..) if w | r => {
                                error!("Withdrawn {}, refunded {}", w, r);
                            }
                            _ => {
                                info!("All checks passed");
                                let rpc_path = make_rpc_path(plugin.clone());

                                match pay_invoice(&rpc_path, n.bolt11.clone()).await {
                                    Ok(PayResponse {
                                        payment_preimage, ..
                                    }) => {
                                        info!("Settlement confirmed, preimage revealed");
                                        let mut preimage = [0u8; 32];
                                        // TODO: check length
                                        preimage.copy_from_slice(&payment_preimage.to_vec());

                                        let tx_htlc = htlc.withdraw(hashlock, preimage);
                                        match tx_htlc.send().await {
                                            Ok(pending_tx) => {
                                                let receipt = pending_tx
                                                    .await?
                                                    .ok_or_else(|| error!("Tx dropped from mempool"));
                                                match receipt {
                                                    Ok(r) => {
                                                        let tx = match client.get_transaction(r.transaction_hash).await {
                                                            Ok(tx) => tx,
                                                            Err(e) => {
                                                                error!("Cant get transaction due to {}", e);
                                                                continue
                                                            }
                                                        } ;
                                                        // TODO: fees & look into Receipt data structure for something useful
                                                        info!("Sent tx: {}", r.transaction_hash);
                                                        debug!("Raw tx: {}\n", serde_json::to_string(&tx)?);
                                                        debug!("Full receipt: {}", serde_json::to_string(&r)?);
                                                    }
                                                    _ => {
                                                        error!("Couldn't receipt of the transaction");
                                                        let _res = cb_client
                                                            .post(event_callback.clone())
                                                            .json(&SubmitEvent {
                                                                meta: None,
                                                                event: "error".to_string(),
                                                                data: HTLCEvent::RouterContractError(RouterContractError {
                                                                    address: htlc_address.to_string(),
                                                                    receiver: "".to_string(),
                                                                    hashlock: hashlock_str,
                                                                    message: "No receipt received".to_string(),
                                                                }),
                                                            })
                                                            .send()
                                                            .await?;
                                                        continue;
                                                    }
                                                }
                                            }
                                            Err(e) => match e {
                                                ContractError::Revert(r) => {
                                                    let msg = String::decode_with_selector(&r).unwrap();
                                                    info!("Failed to redeem HTLC with {}. Hash {}", msg, hashlock_str);
                                                    let _res = cb_client
                                                        .post(event_callback.clone())
                                                        .json(&SubmitEvent {
                                                            meta: None,
                                                            event: "error".to_string(),
                                                            data: HTLCEvent::RouterContractError(RouterContractError {
                                                                address: htlc_address.to_string(),
                                                                receiver: cln_address.to_string(),
                                                                hashlock: hashlock_str,
                                                                message: msg.clone(),
                                                            }),
                                                        })
                                                        .send()
                                                        .await?;
                                                    continue;
                                                }
                                                _ => {}
                                            },
                                        };

                                    }
                                    Err(e) => {
                                        error!("Payment failed {:?}", e);
                                    }
                                };
                            }
                        };
                    }
                    Err(_) => error!("No hashlocked tokens for {}", hashlock_str),
                };
            }
            Ok(Ok(Notification::GasPrice(v))) => {
                if v != U256::zero() {
                    continue;
                };
                match oracle.fetch().await {
                    Ok(gas_price) => {
                        match notification_sender.send(Notification::GasPrice(gas_price)) {
                            Ok(_) => debug!("Gas price oracle sent back {gas_price:?}"),
                            Err(e) => error!("Couldnt send notification back: {e:?}"),
                        };
                    }
                    Err(e) => error!("Gas price oracle: {e:?}"),
                }
            }
            _ => {
                let block_number = match provider.get_block_number().await {
                    Ok(h) => h,
                    Err(e) => {
                        error!("Cant get block tip due to {}", e);
                        continue
                    }
                } ;
                info!("No messages for worker. Ethereum height {block_number}")
            }
        }
        time::sleep(Duration::from_secs(sleep_time)).await;
    }
}
