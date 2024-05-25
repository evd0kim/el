import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import ClipboardJS from 'clipboard'

import { albyAsyncActions } from '~/services/alby'
import { connectToAlby, sendPaymentAlby } from '~/services/alby/alby.service'
import { withdraw } from '~/services/contract'
import { useHtlcInSetMutation } from '~/services/htlc'
import { htlcActions } from '~/services/htlc/htlc.slice'
import { metaMaskAsyncActions } from '~/services/meta-mask'
import { useAppDispatch, useAppSelector } from '~/services/store'
import { Button } from '~/shared/button'
import IconCopy from '~/shared/icons/IconCopy'
import { Loader } from '~/shared/loader'
import { Timer } from '~/shared/timer'
import Typography from '~/shared/typography/typography'
import { currencyData, networks } from '~/shared/variables/variables'

import s from './ln-to-wbtc.module.scss'

// const erc20Address = import.meta.env.VITE_ERC20_ADDRESS

type Props = {
  handleFormReset: () => void
}

export const LnToWbtc = ({ handleFormReset }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false)
  const [postHtlcInSet, {}] = useHtlcInSetMutation()
  const dispatch = useAppDispatch()
  const network = useAppSelector(state => state.app.exchange.network)
  const htlc = useAppSelector(state => state.htlc)
  const { eventName, htlcInInit, htlcInSet, payFeeIn, payInvoiceIn } = htlc
  const { fee_invoice, fee_sat, secret_hash } = htlcInInit.response
  const { sats } = currencyData
  const addressMetaMask = useAppSelector(state => state.metaMask.address)
  const paymentProof = payFeeIn.paymentProof
  const { preimage } = payInvoiceIn
  const { incoming_invoice } = htlcInSet.response
  const { amount } = useAppSelector(state => state.app.exchange)
  const contractAddress = network ? networks[network].contractAddress : ''
  const tokenContract = network ? networks[network].tokenContract : ''

  useEffect(() => {
    const processEvent = async () => {
      if (eventName === 'HTLCERC20New') {
        toast.info(`Your contract has been created`, {
          draggable: false,
          progressStyle: { background: 'var(--color-accent-lime)' },
        })
        const res = await sendPaymentAlby(incoming_invoice)

        dispatch(htlcActions.setPreimageIn({ preimage: res?.preimage }))

        await withdraw('0x' + secret_hash, '0x' + res?.preimage, contractAddress)

        dispatch(metaMaskAsyncActions.fetchMetaMaskBalance())
        await dispatch(albyAsyncActions.fetchAlbyBalance())
        setIsLoading(false)
        toast.success(`Success!`, {
          draggable: false,
          progressStyle: { background: 'var(--color-accent-lime)' },
        })
        handleFormReset()
      }
    }

    processEvent()
  }, [dispatch, eventName, incoming_invoice])

  const handleOnClick = async () => {
    setIsButtonDisabled(true)
    setIsLoading(true)
    try {
      // await connectToAlby()
      const res = await sendPaymentAlby(fee_invoice)

      await dispatch(albyAsyncActions.fetchAlbyBalance())

      if (res?.preimage) {
        dispatch(htlcActions.setPaymentProofIn({ paymentProof: res.preimage }))
        if (addressMetaMask && res.preimage && secret_hash && tokenContract) {
          const targetNetwork = network ? networks[network].targetNetwork : ''

          const payload = {
            address: addressMetaMask,
            payment_proof: res.preimage,
            secret_hash: secret_hash,
            token: tokenContract,
          }

          postHtlcInSet({ targetNetwork, ...payload })
          toast.info(`Creating a contract`, {
            draggable: false,
            progressStyle: { background: 'var(--color-accent-lime)' },
          })
        }
      }
    } catch (error: any) {
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
  initializeClipboard('#copyPreimage')

  const commissionPercentage = (
    (fee_sat / Math.round(parseFloat(amount) * 100000000)) *
    100
  ).toFixed(1)

  return (
    <>
      <div className={s.LnToWbtcWrapper}>
        <div className={s.LnToWbtcContainer}>
          <Typography.Body6 className={s.LnToWbtcFee}>Fee:</Typography.Body6>
          <Typography.Body6>{commissionPercentage} %</Typography.Body6>
        </div>
        {/*<Typography.Body3>
          {fee_sat} {sats}
        </Typography.Body3>*/}
        {/*{incoming_invoice && (*/}
        {/*  <div>*/}
        {/*    <Typography.H3>Incoming invoice:</Typography.H3>*/}
        {/*    <div className={s.LnToWbtcInfoWrapper}>*/}
        {/*      <Typography.Body3>*/}
        {/*        invoice {`${incoming_invoice.slice(0, 8)}...${incoming_invoice.slice(-8)}`}*/}
        {/*      </Typography.Body3>*/}
        {/*      <Button*/}
        {/*        data-clipboard-text={incoming_invoice}*/}
        {/*        id={'copyInvoice'}*/}
        {/*        type={'button'}*/}
        {/*        variant={'default'}*/}
        {/*      >*/}
        {/*        <IconCopy className={s.LnToWbtcButtonIcon} />*/}
        {/*      </Button>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*)}*/}
        {/*{secret_hash && preimage && (*/}
        {/*  <div>*/}
        {/*    <Typography.H3>Withdraw:</Typography.H3>*/}
        {/*    <div className={s.LnToWbtcInfoWrapper}>*/}
        {/*      <Typography.Body3>*/}
        {/*        hash 0x{`${secret_hash.slice(0, 8)}...${secret_hash.slice(-8)}`}*/}
        {/*      </Typography.Body3>*/}
        {/*      <Button*/}
        {/*        data-clipboard-text={secret_hash}*/}
        {/*        id={'copyHash'}*/}
        {/*        type={'button'}*/}
        {/*        variant={'default'}*/}
        {/*      >*/}
        {/*        <IconCopy className={s.LnToWbtcButtonIcon} />*/}
        {/*      </Button>*/}
        {/*    </div>*/}
        {/*    <div className={s.LnToWbtcInfoWrapper}>*/}
        {/*      <Typography.Body3>*/}
        {/*        preimage 0x{`${preimage.slice(0, 8)}...${preimage.slice(-8)}`}*/}
        {/*      </Typography.Body3>*/}
        {/*      <Button*/}
        {/*        data-clipboard-text={preimage}*/}
        {/*        id={'copyPreimage'}*/}
        {/*        type={'button'}*/}
        {/*        variant={'default'}*/}
        {/*      >*/}
        {/*        <IconCopy className={s.LnToWbtcButtonIcon} />*/}
        {/*      </Button>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*)}*/}
      </div>
      {isButtonDisabled && <Timer />}
      {/*{isButtonDisabled && (*/}
      {/*  <div className={s.LnToWbtcLoaderWrapper}>*/}
      {/*    <Loader />*/}
      {/*  </div>*/}
      {/*)}*/}
      <Button
        className={s.LnToWbtcButton}
        disabled={isButtonDisabled}
        onClick={handleOnClick}
        type={'button'}
      >
        Accept Offer
      </Button>
    </>
  )
}
