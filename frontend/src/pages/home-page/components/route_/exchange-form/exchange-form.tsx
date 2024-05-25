import React, { ComponentPropsWithoutRef, FC, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import { zodResolver } from '@hookform/resolvers/zod'
import { clsx } from 'clsx'
import { ethers } from 'ethers'
import { z } from 'zod'

import { BTCPriceStream } from '~/pages/home-page/components/main/info/BTCPriceSteam/BTCPriceSteam'
import { ControlInput } from '~/pages/home-page/components/route_/exchange-form/control-input/control-input'
import { Swap } from '~/pages/home-page/components/route_/exchange-form/swap'
import { appActions } from '~/services/app'
import { useHtlcInInitMutation, useHtlcOutInitMutation } from '~/services/htlc'
import { htlcActions } from '~/services/htlc/htlc.slice'
import { useAppDispatch, useAppSelector } from '~/services/store'
import { Button } from '~/shared/button'
import IconReverse from '~/shared/icons/IconsReverse'
import { Loader } from '~/shared/loader'
import { NewSelect } from '~/shared/new-select/new-select'
import { Select } from '~/shared/select'
import Typography from '~/shared/typography/typography'
import { networks, statusData, unit } from '~/shared/variables'

import s from './exchange-form.module.scss'

const isEmptyString = (value: string) => {
  return value.trim() === ''
}

const isCorrectAmount = (value: string) => {
  const bigValue = ethers.parseUnits(value, unit.wbtc)

  return bigValue >= ethers.parseUnits('0.00001', unit.wbtc)
}

const isAllowedString = (value: string) => {
  const res = /^\d*\.?\d*$/.test(value)

  if (res) {
    return true
  } else {
    return false
  }
}

const exchangeFormSchema = z.object({
  get: z
    .string()
    .refine(value => !isEmptyString(value), {
      message: 'Required!',
    })
    .refine(value => !isEmptyString(value) && isCorrectAmount(value), {
      message: 'Min. 0.00001',
    }),
  give: z
    .string()
    .refine(value => !isEmptyString(value), {
      message: 'Required!',
    })
    .refine(value => !isEmptyString(value) && isCorrectAmount(value), {
      message: 'Min. 0.00001',
    }),
  // .refine(value => isAllowedString(value), {
  //   message: 'Only digits are allowed',
  // }),
})

type FormValues = z.infer<typeof exchangeFormSchema>

type Props = ComponentPropsWithoutRef<'div'>
export const ExchangeForm: FC<Props> = ({ className, ...rest }) => {
  const dispatch = useAppDispatch()
  const exchange = useAppSelector(state => state.app.exchange)
  const addressMetaMask = useAppSelector(state => state.metaMask.address)
  const { status: metaMaskStatus } = useAppSelector(state => state.metaMask)
  const { status: albyStatus } = useAppSelector(state => state.alby)
  const { amount, get, give } = exchange
  const [isInputFocused, setIsInputFocused] = useState<null | string>(null)
  const [isExchangeFormDisabled, setExchangeFormDisabled] = useState<boolean>(false)
  const isMetaMaskConnected = metaMaskStatus === statusData.succeeded
  const isAlbyConnected = albyStatus === statusData.succeeded
  const { htlcInSet, invoiceOutLn } = useAppSelector(state => state.htlc)
  const { incoming_invoice } = htlcInSet.response
  const { bolt11 } = invoiceOutLn
  const network = useAppSelector(state => state.app.exchange.network)
  const [htlcInInit, { isLoading: htlcInInitLoading }] = useHtlcInInitMutation()
  const [htlcOutInit, { isLoading: htlcOutInitLoading }] = useHtlcOutInitMutation()

  console.log('network', network)

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setFocus,
    setValue,
    trigger,
    watch,
  } = useForm({
    defaultValues: {
      destination: '',
      get: amount,
      give: amount,
    },
    mode: 'onChange',
    resolver: zodResolver(exchangeFormSchema),
  })

  const onSubmit = (formData: FormValues) => {
    setExchangeFormDisabled(true)
    dispatch(appActions.setExchangeAmount({ amount: formData.give }))

    const targetNetwork = network ? networks[network].targetNetwork : ''

    const payload = {
      amount: Math.round(parseFloat(formData.give) * 100000000),
      token: give.toLowerCase(),
    }

    give === 'LN-BTC'
      ? htlcInInit({ targetNetwork, ...payload })
      : htlcOutInit({ targetNetwork, ...payload })
  }

  const handleToInputFocus = () => {
    setIsInputFocused('get')
  }

  const handleInputBlur = () => {
    setIsInputFocused(null)
  }

  const handleFromInputFocus = () => {
    setIsInputFocused('give')
  }

  const handleReverse = () => {
    dispatch(appActions.reverseExchange())
  }

  const handleFocusGive = () => {
    setFocus('give')
  }

  const handleFocusGet = () => {
    setFocus('get')
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = event.target.value

    // Удаляем все символы, кроме цифр и точки
    inputValue = inputValue.replace(/[^\d.]/g, '')

    // Разрешаем только одну точку
    inputValue = inputValue.replace(/(\..*)\./g, '$1')

    // Удаляем ведущие нули перед точкой, кроме нуля перед точкой в десятичных числах
    inputValue = inputValue.replace(/^0+(?!\.|$)/, '')

    // Проверяем, является ли введенное значение числом с плавающей запятой
    const isFloat = /^\d*\.?\d*$/.test(inputValue)

    if (isFloat) {
      setValue('give', inputValue)
      setValue('get', inputValue)
      trigger('give')
      trigger('get')
    }
  }

  const disabledSubmitButton =
    watch('give') === '' ||
    isExchangeFormDisabled ||
    errors?.give?.message ||
    !isAlbyConnected ||
    !isMetaMaskConnected

  const handleFormReset = () => {
    reset()
    dispatch(appActions.setExchangeAmount({ amount: '' }))
    dispatch(htlcActions.resetState())
    setExchangeFormDisabled(false)
  }

  const calculateInputValue = (variant: any) => {
    switch (variant) {
      case 'wBTC':
        return `MetaMask${addressMetaMask ? `: ${addressMetaMask}` : ''}`
      case 'LN-BTC':
        return `Alby${incoming_invoice ? `: ${incoming_invoice}` : ''}${bolt11 ? `: ${bolt11}` : ''}`
      default:
        return ''
    }
  }

  const handleNetworkChange = async (selectedNetwork: any) => {
    if (window.ethereum.isMetaMask) {
      console.log('selectedNetwork', selectedNetwork)
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: networks[selectedNetwork].chainId }],
        })
        dispatch(appActions.setNetwork({ network: selectedNetwork }))
      } catch (switchError) {
        console.log('fail')
      }
    } else {
      console.log('fail')
    }
  }

  return (
    <form className={clsx(s.ExchangeFormRoot, className)} onSubmit={handleSubmit(onSubmit)}>
      <Typography.Error className={s.ExchangeFormError}>
        {errors?.give?.message || errors?.get?.message || ''}
      </Typography.Error>
      <div className={s.ExchangeFormInfoWrapper}>
        <div className={s.ExchangeFormInfoContainer}>
          <div className={s.ExchangeFormInfo}>
            <Typography.Label className={s.ExchangeFormInfoLabel}>Give</Typography.Label>
            <BTCPriceStream inputValue={watch('give')} />
            {network && networks[network]?.name && (
              <NewSelect
                onChange={handleNetworkChange}
                options={Object.entries(networks).map(([key, network]) => ({
                  [key]: network?.name,
                }))}
                value={networks[network]?.name}
              />
            )}
          </div>
          <Select
            className={s.ExchangeFormAmountSelect}
            handleFocus={handleFocusGive}
            inputValue={watch('give')}
            isFocused={isInputFocused === 'give'}
            isSelectBlocked={isExchangeFormDisabled}
            name={'give'}
            value={give}
          >
            <ControlInput
              autoComplete={'off'}
              className={s.ExchangeFormAmountInput}
              control={control}
              disabled={isExchangeFormDisabled}
              name={'give'}
              onBlur={handleInputBlur}
              onChange={handleInputChange}
              onFocus={handleFromInputFocus}
              placeholder={'Enter amount (in BTC)'}
            />
          </Select>
        </div>

        <Button
          className={s.ExchangeFormReverseButton}
          disabled={isExchangeFormDisabled}
          onClick={handleReverse}
          type={'button'}
          variant={'default'}
        >
          <IconReverse className={s.svg} />
        </Button>

        <div className={s.ExchangeFormInfoContainer}>
          <div className={s.ExchangeFormInfo}>
            <Typography.Label className={s.ExchangeFormInfoLabel}>Get</Typography.Label>
            <BTCPriceStream inputValue={watch('get')} />
            {network && networks[network]?.currency && (
              <NewSelect
                onChange={handleNetworkChange}
                options={Object.entries(networks).map(([key, network]) => ({
                  [key]: network.currency,
                }))}
                value={networks[network]?.currency}
              />
            )}
          </div>
          <Select
            className={s.ExchangeFormAmountSelect}
            handleFocus={handleFocusGet}
            inputValue={watch('get')}
            isFocused={isInputFocused === 'get'}
            isSelectBlocked={isExchangeFormDisabled}
            name={'get'}
            value={get}
          >
            <ControlInput
              autoComplete={'off'}
              className={s.ExchangeFormAmountInput}
              control={control}
              disabled={isExchangeFormDisabled}
              name={'get'}
              onBlur={handleInputBlur}
              onChange={handleInputChange}
              onFocus={handleToInputFocus}
              placeholder={'Enter amount (in BTC)'}
            />
          </Select>
        </div>
      </div>
      <div className={s.ExchangeFormInfoWrapper}>
        <div className={s.ExchangeFormInfoContainer}>
          <div className={s.ExchangeFormInfo}>
            <Typography.Label className={s.ExchangeFormInfoLabel}>Source</Typography.Label>
            <Typography.Error className={s.ExchangeFormError}>
              {!isAlbyConnected && (
                <Typography.Error className={s.ExchangeFormError}>
                  Alby not connected!
                </Typography.Error>
              )}

              {!isMetaMaskConnected && isAlbyConnected && (
                <Typography.Error className={s.ExchangeFormError}>
                  MetaMask not connected!
                </Typography.Error>
              )}
            </Typography.Error>
          </div>
          <input
            autoComplete={'off'}
            className={s.ExchangeFormInfoInput}
            disabled={isExchangeFormDisabled}
            name={'source'}
            readOnly
            value={calculateInputValue(give)}
          />
        </div>

        <div className={s.ExchangeFormInfoContainer}>
          <div className={s.ExchangeFormInfo}>
            <Typography.Label className={s.ExchangeFormInfoLabel}>Destination</Typography.Label>
          </div>
          <input
            autoComplete={'off'}
            className={s.ExchangeFormInfoInput}
            disabled={isExchangeFormDisabled}
            name={'destination'}
            readOnly
            value={calculateInputValue(get)}
          />
        </div>
      </div>
      {/*{(htlcInInitLoading || htlcOutInitLoading) && (*/}
      {/*  <div*/}
      {/*    style={{*/}
      {/*      display: 'grid',*/}
      {/*      height: '100px',*/}
      {/*      placeContent: 'center',*/}
      {/*      width: '100%',*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <Loader />*/}
      {/*  </div>*/}
      {/*)}*/}
      {amount && !htlcInInitLoading && !htlcOutInitLoading ? (
        <Swap handleFormReset={handleFormReset} />
      ) : (
        <Button
          className={s.ExchangeSubmitButton}
          disabled={!!disabledSubmitButton || isExchangeFormDisabled}
          variant={'primary'}
        >
          Swap
        </Button>
      )}
    </form>
  )
}
