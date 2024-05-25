import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import ClipboardJS from 'clipboard'
import { parseUnits } from 'ethers'

import { albyAsyncActions, connectToAlby, makeInvoiceAlby } from '~/services/alby'
import { newContract, refund } from '~/services/contract'
import { useHtlcOutSetMutation } from '~/services/htlc'
import { htlcActions } from '~/services/htlc/htlc.slice'
import {
  approveFundsMetaMask,
  getBalanceMetaMask,
  makeContractMetaMask,
  metaMaskAsyncActions,
} from '~/services/meta-mask'
import { useAppDispatch, useAppSelector } from '~/services/store'
import { Button } from '~/shared/button'
import IconCopy from '~/shared/icons/IconCopy'
import { Loader } from '~/shared/loader'
import { Timer } from '~/shared/timer'
import Typography from '~/shared/typography/typography'
import { currencyData, networks, unit } from '~/shared/variables/variables'

import s from './wbtc-to-ln.module.scss'

type Props = {
  handleFormReset: () => void
}

// const tokenDecimals = import.meta.env.VITE_ERC20_DECIMALS

export const WbtcToLn = ({ handleFormReset }: Props) => {
  const network = useAppSelector(state => state.app.exchange.network)
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false)
  const [htlcOutSet, {}] = useHtlcOutSetMutation()
  const htlc = useAppSelector(state => state.htlc)
  const { eventName, htlcOutInit, invoiceOutLn, txOut } = htlc
  const { address, fee_sat } = htlcOutInit.response
  const { bolt11, hash } = invoiceOutLn
  const amount = useAppSelector(state => state.app.exchange.amount)
  const addressMetaMask = useAppSelector(state => state.metaMask.address)
  const [isRefundVisible, setIsRefundVisible] = useState<boolean>(false)
  const contractAddress = network ? networks[network].contractAddress : ''
  const tokenContract = network ? networks[network].tokenContract : ''

  useEffect(() => {
    console.log(eventName)
    let timerId

    if (bolt11 && txOut && eventName === 'HTLCERC20New') {
      toast.info(`Your contract has been created`, {
        draggable: false,
        progressStyle: { background: 'var(--color-accent-lime)' },
      })
      const targetNetwork = network ? networks[network].targetNetwork : ''
      const payload = {
        bolt11: bolt11,
        tx: txOut,
      }

      htlcOutSet({ targetNetwork, ...payload })
      timerId = setTimeout(
        () => {
          setIsRefundVisible(true)
        },
        3 * 60 * 1000
      )
    }
    if (eventName === 'HTLCERC20Withdraw') {
      dispatch(albyAsyncActions.fetchAlbyBalance())
      toast.success(`Success!`, {
        draggable: false,
        progressStyle: { background: 'var(--color-accent-lime)' },
      })
      setIsLoading(false)
      handleFormReset()
    }

    return () => {
      clearTimeout(timerId)
    }
  }, [bolt11, txOut, eventName, htlcOutSet])

  const handleOnClick = async () => {
    setIsButtonDisabled(true)
    setIsLoading(true)
    try {
      await connectToAlby(dispatch)
      const feeAmountBigintLn = parseUnits(
        (fee_sat / Math.pow(10, unit.btc)).toFixed(unit.btc),
        unit.btc
      )
      const feeAmountBigintWbtc = parseUnits(
        (fee_sat / Math.pow(10, unit.wbtc)).toFixed(unit.wbtc),
        unit.wbtc
      )
      const amountLn = parseUnits(amount, unit.btc)
      const amountWbtc = parseUnits(amount, unit.wbtc)
      const amountLnWithoutFee = (amountLn - feeAmountBigintLn).toString()
      const amountWbtcWithoutFee = amountWbtc - feeAmountBigintWbtc

      console.log('feeAmountBigintLn', feeAmountBigintLn)
      console.log('feeAmountBigintWbtc', feeAmountBigintWbtc)
      console.log('amountLn', amountLn)
      console.log('amountWbtc', amountWbtc)
      console.log('amountLnWithoutFee', amountLnWithoutFee)
      console.log('amountWbtcWithoutFee', amountWbtcWithoutFee)

      const invoice: { paymentRequest: string; rHash: string } =
        await makeInvoiceAlby(amountLnWithoutFee)

      console.log('invoice', invoice)
      console.log('alby invoice', amountLnWithoutFee)
      dispatch(htlcActions.setInvoiceOutLn({ bolt11: invoice.paymentRequest, hash: invoice.rHash }))
      // const amountWbtc = parseUnits(amount, unit.wbtc)
      if (network) {
        const { contract, signer } = await makeContractMetaMask(network)
        const walletBalance = await getBalanceMetaMask({
          address: addressMetaMask,
          contract: contract,
        })

        if (walletBalance >= amountWbtc) {
          console.log('approve')
          await approveFundsMetaMask(contract, amountWbtc, network)
          console.log('approve MetaMask', amountWbtc)
          const byteArrayHash = new Uint8Array(
            (invoice?.rHash?.match(/.{1,2}/g) || []).map(byte => parseInt(byte, 16))
          )

          if (address) {
            toast.info(`Creating a contract`, {
              draggable: false,
              progressStyle: { background: 'var(--color-accent-lime)' },
            })

            const tx = await newContract(
              address,
              byteArrayHash,
              amountWbtc,
              tokenContract,
              contractAddress
            )

            console.log('newContract', amountWbtc)
            dispatch(htlcActions.setTxOut({ tx: tx }))
            dispatch(metaMaskAsyncActions.fetchMetaMaskBalance())
          }
        }
      } else {
        console.log('err')
      }
    } catch (error: any) {
      console.log('error', error)
      toast.error(error?.info?.error?.message || error?.message || 'Some error', {
        draggable: false,
        progressStyle: { background: 'var(--color-alert)' },
      })
    }
  }

  const handleRefund = async () => {
    try {
      if (hash) {
        await refund(hash, contractAddress)
        const { contract, signer } = await makeContractMetaMask(network)
        const walletBalance = await getBalanceMetaMask({
          address: addressMetaMask,
          contract: contract,
        })
      }
    } catch (error: any) {
      console.log('error', error)
      toast.error(error?.info?.error?.message || error?.message || 'Some error', {
        draggable: false,
        progressStyle: { background: 'var(--color-alert)' },
      })
    }
  }

  function initializeClipboard(elementSelector: any) {
    const clipboard = new ClipboardJS(elementSelector)

    clipboard.on('success', function (e) {
      e.clearSelection()
    })

    clipboard.on('error', function (e) {
      console.error('Could not copy:', e.action)
    })
  }

  initializeClipboard('#copyInvoice')
  initializeClipboard('#copyHash')
  initializeClipboard('#copyTransaction')

  const commissionPercentage = (
    (fee_sat / Math.round(parseFloat(amount) * 100000000)) *
    100
  ).toFixed(1)

  return (
    <>
      <div className={s.WbtcToLnWrapper}>
        <div className={s.WbtcToLnContainer}>
          <Typography.Body6>Fee:</Typography.Body6>
          <Typography.Body6>{commissionPercentage} %</Typography.Body6>
        </div>
        {/*{bolt11 && hash && (*/}
        {/*  <div>*/}
        {/*    <Typography.H3>Outgoing invoice:</Typography.H3>*/}
        {/*    /!*<div className={s.WbtcToLnInfoWrapper}>*!/*/}
        {/*    /!*  <Typography.Body3>*!/*/}
        {/*    /!*    bolt11 {`${bolt11.slice(0, 8)}...${bolt11.slice(-8)}`}*!/*/}
        {/*    /!*  </Typography.Body3>*!/*/}
        {/*    /!*  <Button*!/*/}
        {/*    /!*    data-clipboard-text={bolt11}*!/*/}
        {/*    /!*    id={'copyInvoice'}*!/*/}
        {/*    /!*    type={'button'}*!/*/}
        {/*    /!*    variant={'default'}*!/*/}
        {/*    /!*  >*!/*/}
        {/*    /!*    <IconCopy className={s.WbtcToLnButtonIcon} />*!/*/}
        {/*    /!*  </Button>*!/*/}
        {/*    /!*</div>*!/*/}
        {/*    /!*<div className={s.WbtcToLnInfoWrapper}>*!/*/}
        {/*    /!*  <Typography.Body3>rHash {`${hash.slice(0, 8)}...${hash.slice(-8)}`}</Typography.Body3>*!/*/}
        {/*    /!*  <Button*!/*/}
        {/*    /!*    data-clipboard-text={hash}*!/*/}
        {/*    /!*    id={'copyHash'}*!/*/}
        {/*    /!*    type={'button'}*!/*/}
        {/*    /!*    variant={'default'}*!/*/}
        {/*    /!*  >*!/*/}
        {/*    /!*    <IconCopy className={s.WbtcToLnButtonIcon} />*!/*/}
        {/*    /!*  </Button>*!/*/}
        {/*    /!*</div>*!/*/}
        {/*  </div>*/}
        {/*)}*/}

        {/*{txOut && (*/}
        {/*  <div>*/}
        {/*    <Typography.H3>Transaction:</Typography.H3>*/}
        {/*    <div className={s.WbtcToLnInfoWrapper}>*/}
        {/*      <Typography.Body3>tx {`${txOut.slice(0, 8)}...${txOut.slice(-8)}`}</Typography.Body3>*/}
        {/*      <Button*/}
        {/*        data-clipboard-text={txOut}*/}
        {/*        id={'copyTransaction'}*/}
        {/*        type={'button'}*/}
        {/*        variant={'default'}*/}
        {/*      >*/}
        {/*        <IconCopy className={s.WbtcToLnButtonIcon} />*/}
        {/*      </Button>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*)}*/}
      </div>
      {/*{isLoading && (*/}
      {/*  <div className={s.WbtcToLnLoaderWrapper}>*/}
      {/*    <Loader />*/}
      {/*  </div>*/}
      {/*)}*/}
      {isButtonDisabled && <Timer />}
      {isRefundVisible ? (
        <Button className={s.WbtcToLnButton} onClick={handleRefund} type={'button'}>
          Refund
        </Button>
      ) : (
        <Button
          className={s.WbtcToLnButton}
          disabled={isButtonDisabled}
          onClick={handleOnClick}
          type={'button'}
        >
          Accept Offer
        </Button>
      )}
    </>
  )
}
