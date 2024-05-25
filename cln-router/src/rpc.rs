use anyhow::{anyhow, Error};
use cln_plugin::Plugin;
use std::path::{Path, PathBuf};

use ethers::{
    types::{Address, U256},
    utils::parse_ether,
};
use hex;

use log::{debug, error, info};
use serde_json::json;
use std::{str::FromStr, time::Duration};

use tokio::time;

use crate::model::PluginState;
use crate::model::{
    ERC20IncomingHTLC, ERC20PayAndRedeemHTLC, ERC20RedeemHTLC, ERC20RefundHTLC, Notification,
    Withdraw, WithdrawERC20,
};
use cln_rpc::primitives::Amount;
use cln_rpc::{
    model::{
        requests::{DecodepayRequest, PayRequest},
        responses::{DecodepayResponse, PayResponse},
    },
    ClnRpc, Request, Response,
};

pub async fn get_gas(
    plugin: Plugin<PluginState>,
    _args: serde_json::Value,
) -> Result<serde_json::Value, Error> {
    info!("Sending Gas request to Worker");
    match plugin
        .state()
        .channel
        .send(Notification::GasPrice(U256::zero()))
    {
        Ok(_) => {
            debug!("Sent notification GasPrice");
        }
        Err(e) => {
            error!("Couldnt send notification: {e:?}");
            return Ok(json!({
                "code": 1,
                "message": "Command failed"
            }));
        }
    };
    let mut notification_receiver = plugin.state().channel.subscribe();

    match time::timeout(Duration::from_secs(60 as u64), notification_receiver.recv()).await {
        Ok(Ok(Notification::GasPrice(gas))) => Ok(json!({
            "code": 0,
            "message": gas.as_u64(),
        })),
        _ => Ok(json!({
            "code": 1,
            "message": "Impossible to request gas"
        })),
    }
}

pub async fn eth_withdraw(
    plugin: Plugin<PluginState>,
    args: serde_json::Value,
) -> Result<serde_json::Value, Error> {
    let valid_arg_keys = vec!["address", "amount"];

    let new_args = assign_arguments(&args, &valid_arg_keys);
    match new_args {
        Ok(a) => {
            if !a["address"].is_string() {
                return Ok(invalid_input_error("address is not a string"));
            }
            if !a["amount"].is_u64() {
                return Ok(invalid_input_error("amount is not a rational number"));
            }
            let address = Address::from_str(a["address"].as_str().unwrap()).unwrap();
            let amount = parse_ether(a["amount"].as_u64().unwrap()).unwrap();
            info!(
                "Sending notification {:?} / {:?} to Worker",
                address, amount
            );
            match plugin
                .state()
                .channel
                .send(Notification::Withdraw(Withdraw { address, amount }))
            {
                Ok(_) => {
                    debug!("Sent notification Withdraw");
                    Ok(json!({
                        "code": 0,
                        "message": "This is fine"
                    }))
                }
                Err(e) => {
                    error!("Couldnt send notification: {e:?}");
                    Ok(json!({
                        "code": 1,
                        "message": "Command failed"
                    }))
                }
            }
        }
        Err(e) => Ok(e),
    }
}

pub async fn erc20_withdraw(
    plugin: Plugin<PluginState>,
    args: serde_json::Value,
) -> Result<serde_json::Value, Error> {
    let valid_arg_keys = vec!["address", "amount"];

    let new_args = assign_arguments(&args, &valid_arg_keys);
    match new_args {
        Ok(a) => {
            if !a["address"].is_string() {
                return Ok(invalid_input_error("address is not a string"));
            }
            if !a["amount"].is_u64() {
                return Ok(invalid_input_error("amount is not a rational number"));
            }
            let address = Address::from_str(a["address"].as_str().unwrap()).unwrap();
            // Native amount
            let token_amount = a["amount"].as_u64().unwrap();
            info!(
                "Sending notification {:?} / {:?} to Worker",
                address, token_amount
            );
            match plugin
                .state()
                .channel
                .send(Notification::WithdrawERC20(WithdrawERC20 {
                    address,
                    token_amount,
                })) {
                Ok(_) => {
                    debug!("Sent notification WithdrawERC20");
                    Ok(json!({
                        "code": 0,
                        "message": "This is fine"
                    }))
                }
                Err(e) => {
                    error!("Couldnt send notification: {e:?}");
                    Ok(json!({
                        "code": 1,
                        "message": "Command failed"
                    }))
                }
            }
        }
        Err(e) => Ok(e),
    }
}

pub async fn set_erc20_htlc(
    plugin: Plugin<PluginState>,
    args: serde_json::Value,
) -> Result<serde_json::Value, Error> {
    let valid_arg_keys = vec!["receiver", "hashlock", "token", "amount"];
    // newContract(receiver, hashlock, timelock, tokenContract, amount) - a
    // sender calls this to create a new HTLC on a given token (tokenContract)
    // for a given amount. A 32 byte contract id is returned
    let new_args = assign_arguments(&args, &valid_arg_keys);
    match new_args {
        Ok(a) => {
            if !a["receiver"].is_string() {
                return Ok(invalid_input_error("receiver is not a string"));
            }
            if !a["hashlock"].is_string() {
                return Ok(invalid_input_error("hashlock is not a string"));
            }
            if !a["token"].is_string() {
                return Ok(invalid_input_error("token address is not a string"));
            }
            if !a["amount"].is_u64() {
                return Ok(invalid_input_error("amount is not a rational number"));
            }
            let receiver = Address::from_str(a["receiver"].as_str().unwrap()).unwrap();
            let token = Address::from_str(a["token"].as_str().unwrap()).unwrap();
            let hash_str = a["hashlock"].as_str().unwrap();

            let hashlock = match hex::decode(hash_str) {
                Ok(b) => b,
                Err(_e) => {
                    return Ok(json!({
                        "code": 1,
                        "message": "Non-hex payment_hash"
                    }))
                }
            };

            let token_amount = a["amount"].as_u64().unwrap();
            info!(
                "Sending incoming ERC20 HTLC notification {:?} / {} / {:?} to Worker",
                receiver, hash_str, token_amount
            );
            match plugin
                .state()
                .channel
                .send(Notification::ERC20IncomingHTLC(ERC20IncomingHTLC {
                    receiver,
                    hashlock,
                    token,
                    token_amount,
                })) {
                Ok(_) => {
                    debug!("Sent notification ERC20IncomingHTLC");
                    Ok(json!({
                        "code": 0,
                        "message": hash_str
                    }))
                }
                Err(e) => {
                    error!("Couldnt send notification: {e:?}");
                    Ok(json!({
                        "code": 1,
                        "message": "Command failed"
                    }))
                }
            }
        }
        Err(e) => Ok(e),
    }
}

pub async fn redeem_erc20_htlc(
    plugin: Plugin<PluginState>,
    args: serde_json::Value,
) -> Result<serde_json::Value, Error> {
    let valid_arg_keys = vec!["hashlock", "preimage"];
    let new_args = assign_arguments(&args, &valid_arg_keys);
    match new_args {
        Ok(a) => {
            if !a["hashlock"].is_string() {
                return Ok(invalid_input_error("hashlock is not a string"));
            }
            if !a["preimage"].is_string() {
                return Ok(invalid_input_error("hashlock is not a string"));
            }
            let hash_str = a["hashlock"].as_str().unwrap();
            let hashlock = match hex::decode(hash_str) {
                Ok(b) => {
                    if b.len() == 32 {
                        b
                    } else {
                        return Ok(json!({
                            "code": 1,
                            "message": "Payment hash has incorrect size"
                        }));
                    }
                }
                Err(_e) => {
                    return Ok(json!({
                        "code": 1,
                        "message": "Non-hex payment_hash"
                    }))
                }
            };
            let preimage_str = a["preimage"].as_str().unwrap();
            let preimage = match hex::decode(preimage_str) {
                Ok(b) => {
                    if b.len() == 32 {
                        b
                    } else {
                        return Ok(json!({
                            "code": 1,
                            "message": "Preimage has incorrect size"
                        }));
                    }
                }
                Err(_e) => {
                    return Ok(json!({
                        "code": 1,
                        "message": "Non-hex preimage"
                    }))
                }
            };
            info!("Sending redeem ERC20 HTLC notification {}", hash_str);
            match plugin
                .state()
                .channel
                .send(Notification::ERC20RedeemHTLC(ERC20RedeemHTLC {
                    hashlock,
                    preimage,
                })) {
                Ok(_) => {
                    debug!("Sent notification ERC20IncomingHTLC");
                    Ok(json!({
                        "code": 0,
                        "message": hash_str
                    }))
                }
                Err(e) => {
                    error!("Couldnt send notification: {e:?}");
                    Ok(json!({
                        "code": 1,
                        "message": "Command failed"
                    }))
                }
            }
        }
        Err(e) => Ok(e),
    }
}

pub async fn refund_erc20_htlc(
    plugin: Plugin<PluginState>,
    args: serde_json::Value,
) -> Result<serde_json::Value, Error> {
    let valid_arg_keys = vec!["hashlock"];
    // newContract(receiver, hashlock, timelock, tokenContract, amount) - a
    // sender calls this to create a new HTLC on a given token (tokenContract)
    // for a given amount. A 32 byte contract id is returned
    let new_args = assign_arguments(&args, &valid_arg_keys);
    match new_args {
        Ok(a) => {
            if !a["hashlock"].is_string() {
                return Ok(invalid_input_error("hashlock is not a string"));
            }
            let hash_str = a["hashlock"].as_str().unwrap();
            let hashlock = match hex::decode(hash_str) {
                Ok(b) => b,
                Err(_e) => {
                    return Ok(json!({
                        "code": 1,
                        "message": "Non-hex payment_hash"
                    }))
                }
            };
            info!("Sending refund ERC20 HTLC notification {}", hash_str);
            match plugin
                .state()
                .channel
                .send(Notification::ERC20RefundHTLC(ERC20RefundHTLC { hashlock }))
            {
                Ok(_) => {
                    debug!("Sent notification Withdraw");
                    Ok(json!({
                        "code": 0,
                        "message": hash_str
                    }))
                }
                Err(e) => {
                    error!("Couldnt send notification: {e:?}");
                    Ok(json!({
                        "code": 1,
                        "message": "Command failed"
                    }))
                }
            }
        }
        Err(e) => Ok(e),
    }
}

fn assign_arguments(
    args: &serde_json::Value,
    keys: &Vec<&str>,
) -> Result<serde_json::Value, serde_json::Value> {
    let mut new_args = serde_json::Value::Object(Default::default());
    match args {
        serde_json::Value::Array(a) => {
            if a.len() != keys.len() {
                return Err(invalid_argument_amount(&a.len(), &keys.len()));
            }
            for (idx, arg) in a.iter().enumerate() {
                if idx < keys.len() {
                    new_args[keys[idx]] = arg.clone();
                }
            }
        }
        serde_json::Value::Object(o) => {
            for (k, v) in o.iter() {
                if !keys.contains(&k.as_str()) {
                    return Err(invalid_argument_error(k));
                }
                new_args[k] = v.clone();
            }
        }
        _ => return Err(invalid_input_error(&args.to_string())),
    };
    Ok(new_args.clone())
}

fn invalid_argument_error(arg: &str) -> serde_json::Value {
    json!({
        "code": 1,
        "message": format!("Invalid argument: '{}'", arg)
    })
}

fn invalid_input_error(input: &str) -> serde_json::Value {
    json!({
        "code": 1,
        "message": format!("Invalid input: '{}'", input)
    })
}

fn invalid_argument_amount(size: &usize, needed: &usize) -> serde_json::Value {
    json!({
        "code": 1,
        "message": format!("Provided '{}', needed '{}'", size, needed)
    })
}

pub async fn pay_redeem_erc20_htlc(
    plugin: Plugin<PluginState>,
    args: serde_json::Value,
) -> Result<serde_json::Value, Error> {
    let valid_arg_keys = vec!["bolt11", "tx"];
    let new_args = assign_arguments(&args, &valid_arg_keys);
    match new_args {
        Ok(a) => {
            if !a["tx"].is_string() {
                return Ok(invalid_input_error("tx is not a string"));
            }
            let tx = a["tx"]
                .to_string()
                .trim_matches(|c: char| !c.is_alphanumeric())
                .to_owned()
                .to_string();
            if !a["bolt11"].is_string() {
                return Ok(invalid_input_error("bolt11 is not a string"));
            }
            let bolt11 = a["bolt11"]
                .to_string()
                .trim_matches(|c: char| !c.is_alphanumeric())
                .to_owned()
                .to_string();
            info!("Received tx {}, now decoding bolt11 {}", tx, bolt11);
            let rpc_path = make_rpc_path(plugin.clone());

            let (hash_str, invoice_msat) = match decode_invoice(&rpc_path, bolt11.clone()).await {
                Ok(DecodepayResponse {
                    payment_hash,
                    amount_msat,
                    ..
                }) => {
                    let amount = match amount_msat {
                        None => {
                            return Ok(json!({
                                "code": 1,
                                "message": "Amountless invoices cant be accepted",
                            }));
                        }
                        Some(a) => a.msat().clone(),
                    };
                    (
                        payment_hash
                            .to_string()
                            .trim_matches(|c: char| !c.is_alphanumeric())
                            .to_owned(),
                        amount,
                    )
                }
                Err(_) => {
                    return Ok(json!({
                        "code": 1,
                        "message": "Impossible to decode BOLT11 invoice",
                    }));
                }
            };

            // decodepay returns a valid payment_hash
            let hashlock = hex::decode(hash_str.clone()).unwrap();

            info!(
                "Sending pay and redeem ERC20 HTLC notification {}",
                hash_str
            );
            match plugin
                .state()
                .channel
                .send(Notification::ERC20PayAndRedeemHTLC(ERC20PayAndRedeemHTLC {
                    hashlock,
                    bolt11,
                    invoice_msat,
                })) {
                Ok(_) => {
                    debug!("Sent notification PayAndRedeem");
                    Ok(json!({
                        "code": 0,
                        "message": hash_str
                    }))
                }
                Err(e) => {
                    error!("Couldnt send notification: {e:?}");
                    Ok(json!({
                        "code": 1,
                        "message": "Command failed"
                    }))
                }
            }
        }
        Err(e) => Ok(e),
    }
}

pub fn make_rpc_path(plugin: Plugin<PluginState>) -> PathBuf {
    Path::new(&plugin.configuration().lightning_dir).join(plugin.configuration().rpc_file)
}

pub async fn decode_invoice(rpc_path: &PathBuf, bolt1: String) -> Result<DecodepayResponse, Error> {
    let mut rpc = ClnRpc::new(&rpc_path).await?;
    let decoded = rpc
        .call(Request::DecodePay(DecodepayRequest {
            bolt11: bolt1,
            description: None,
        }))
        .await
        .map_err(|e| anyhow!("Error calling decodepay: {:?}", e))?;
    match decoded {
        Response::DecodePay(info) => Ok(info),
        e => Err(anyhow!("Unexpected result in decodepay: {:?}", e)),
    }
}

pub async fn pay_invoice(rpc_path: &PathBuf, bolt1: String) -> Result<PayResponse, Error> {
    let mut rpc = ClnRpc::new(&rpc_path).await?;
    let decoded = rpc
        .call(Request::Pay(PayRequest {
            bolt11: bolt1,
            retry_for: Some(120),
            maxfeepercent: Some(1.),
            maxdelay: None,
            // Less critical parameters
            maxfee: None,
            amount_msat: None,
            label: None,
            riskfactor: None,
            exemptfee: None,
            localinvreqid: None,
            exclude: None,
            description: None,
        }))
        .await
        .map_err(|e| anyhow!("Error calling payinvoice: {:?}", e))?;
    match decoded {
        Response::Pay(info) => Ok(info),
        e => Err(anyhow!("Unexpected result in payinvoice: {:?}", e)),
    }
}
