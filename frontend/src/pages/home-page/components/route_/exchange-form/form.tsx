import React, { ComponentPropsWithoutRef, FC, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { clsx } from 'clsx'
import { addDays, addYears } from 'date-fns'
import { ethers } from 'ethers'
import { z } from 'zod'

import { ControlInput } from '~/pages/home-page/components/route_/exchange-form/control-input/control-input'
import { Swap } from '~/pages/home-page/components/route_/exchange-form/swap'
import { appActions } from '~/services/app'
import { htlcActions } from '~/services/htlc/htlc.slice'
import { useAppDispatch, useAppSelector } from '~/services/store'
import { Button } from '~/shared/button'
import { NewSelect } from '~/shared/new-select/new-select'
import Typography from '~/shared/typography/typography'
import { formData, networks, statusData, unit } from '~/shared/variables'

import s from './form.module.scss'

const isEmptyString = (value: string) => {
  return value.trim() === ''
}

const isCorrectAmount = (value: string) => {
  const bigValue = ethers.parseUnits(value, unit.wbtc)

  return bigValue >= ethers.parseUnits('0.00001', unit.wbtc)
}

const { inputData, inputFreeInbound, inputFreeOutbound, inputLiquidity, inputSource } = formData
const tomorrow = addDays(new Date(), 1)
const nextYear = addYears(new Date(), 1)

const exchangeFormSchema = z.object({
  [inputData.name]: z
    .date()
    .refine(date => date >= tomorrow, { message: 'Date must be no earlier than tomorrow' }),
  [inputFreeInbound.name]: z
    .string()
    .refine(value => !isEmptyString(value), {
      message: 'Required!',
    })
    .refine(value => !isEmptyString(value) && isCorrectAmount(value), {
      message: 'Min. 0.00001',
    }),
  [inputFreeOutbound.name]: z
    .string()
    .refine(value => !isEmptyString(value), {
      message: 'Required!',
    })
    .refine(value => !isEmptyString(value) && isCorrectAmount(value), {
      message: 'Min. 0.00001',
    }),
  [inputLiquidity.name]: z
    .string()
    .refine(value => !isEmptyString(value), {
      message: 'Required!',
    })
    .refine(value => !isEmptyString(value) && isCorrectAmount(value), {
      message: 'Min. 0.00001',
    }),
})

type FormValues = z.infer<typeof exchangeFormSchema>

type Props = ComponentPropsWithoutRef<'div'>
export const ExchangeForm: FC<Props> = ({ className, ...rest }) => {
  const dispatch = useAppDispatch()
  const exchange = useAppSelector(state => state.app.exchange)
  const addressMetaMask = useAppSelector(state => state.metaMask.address)
  const { status: metaMaskStatus } = useAppSelector(state => state.metaMask)
  const { amount } = exchange
  const [isExchangeFormDisabled, setExchangeFormDisabled] = useState<boolean>(false)
  const isMetaMaskConnected = metaMaskStatus === statusData.succeeded
  const network = useAppSelector(state => state.app.exchange.network)

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
  } = useForm({
    defaultValues: {
      [inputData.name]: nextYear,
      [inputFreeInbound.name]: '',
      [inputFreeOutbound.name]: '',
      [inputLiquidity.name]: '',
    },
    mode: 'onChange',
    resolver: zodResolver(exchangeFormSchema),
  })

  const onSubmit = (formData: FormValues) => {
    console.log('formData', formData)
  }

  const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    const subscription = watch(values => {
      const sum = [inputFreeInbound.name, inputFreeOutbound.name, inputLiquidity.name].reduce(
        (acc, fieldName) => {
          const value = values[fieldName]

          if (typeof value === 'string') {
            return acc + (parseFloat(value) || 0)
          } else {
            return acc
          }
        },
        0
      )

      setTotal(sum)
    })

    return () => subscription.unsubscribe()
  }, [watch, inputFreeInbound.name, inputFreeOutbound.name, inputLiquidity.name])

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
      setValue('one', inputValue)
      setValue('two', inputValue)
      setValue('three', inputValue)
      trigger('one')
      trigger('two')
      trigger('three')
    }
  }

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
      default:
        return ''
    }
  }

  const handleNetworkChange = async (selectedNetwork: any) => {
    if (window.ethereum.isMetaMask) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: networks[selectedNetwork].chainId }],
        })
        dispatch(appActions.setNetwork({ network: selectedNetwork }))
      } catch (switchError) {
        console.error('error', switchError)
      }
    } else {
      console.error('fail network change')
    }
  }

  function formatBTC(value: number) {
    const formatted = parseFloat(value.toFixed(8)) // Округляем до 8 знаков и убираем лишние нули

    return formatted === 0 ? '0' : formatted.toString() // Если результат 0, возвращаем "0", иначе строку числа
  }

  return (
    <form className={clsx(s.ExchangeFormRoot, className)} onSubmit={handleSubmit(onSubmit)}>
      <Typography.Error className={s.ExchangeFormError}>
        {!isMetaMaskConnected ? 'MetaMask not connected!' : ''}
      </Typography.Error>
      {network && networks[network]?.name && (
        <NewSelect
          onChange={handleNetworkChange}
          options={Object.entries(networks).map(([key, network]) => ({
            [key]: network?.name,
          }))}
          value={networks[network]?.name}
        />
      )}
      <div className={s.InputWrapper}>
        <Typography.Label>{inputData.label}</Typography.Label>
        <ControlInput
          autoComplete={'off'}
          className={s.InputWrapper}
          control={control}
          disabled={isExchangeFormDisabled}
          minDate={tomorrow}
          name={inputData.name}
          type={'date'}
        />
        <Typography.Error className={s.FormError}>
          {errors[inputData.name]?.message || ''}
        </Typography.Error>
      </div>

      <div className={s.InputWrapper}>
        <Typography.Label className={s.InputLabel}>{inputSource.label}</Typography.Label>
        <input
          autoComplete={'off'}
          disabled={isExchangeFormDisabled}
          name={inputSource.name}
          readOnly
          value={calculateInputValue('wBTC')}
        />
        <Typography.Error className={s.FormError}>
          {errors[inputSource.name]?.message || ''}
        </Typography.Error>
      </div>

      <div className={s.InputWrapper}>
        <Typography.Label className={s.InputLabel}>{inputLiquidity.label}</Typography.Label>
        <ControlInput
          autoComplete={'off'}
          control={control}
          disabled={isExchangeFormDisabled}
          name={inputLiquidity.name}
          onChange={handleInputChange}
          placeholder={'Enter amount in BTC'}
        />
        <Typography.Error className={s.FormError}>
          {errors[inputLiquidity.name]?.message || ''}
        </Typography.Error>
      </div>

      <div className={s.InputWrapper}>
        <Typography.Label className={s.InputLabel}>{inputFreeInbound.label}</Typography.Label>
        <ControlInput
          autoComplete={'off'}
          control={control}
          disabled={isExchangeFormDisabled}
          name={inputFreeInbound.name}
          onChange={handleInputChange}
          placeholder={'Enter amount in BTC'}
        />
        <Typography.Error className={s.FormError}>
          {errors[inputFreeInbound.name]?.message || ''}
        </Typography.Error>
      </div>

      <div className={s.InputWrapper}>
        <Typography.Label className={s.ExchangeFormInfoLabel}>
          {inputFreeOutbound.label}
        </Typography.Label>
        <ControlInput
          autoComplete={'off'}
          control={control}
          disabled={isExchangeFormDisabled}
          name={inputFreeOutbound.name}
          onChange={handleInputChange}
          placeholder={'Enter amount in BTC'}
        />
        <Typography.Error className={s.FormError}>
          {errors[inputFreeOutbound.name]?.message || ''}
        </Typography.Error>
      </div>
      {amount ? (
        <Swap handleFormReset={handleFormReset} />
      ) : (
        <div className={s.ButtonsWrapper}>
          <Button disabled={false}>Mint</Button>
          <Button disabled={false} type={'button'}>
            Burn
          </Button>
        </div>
      )}
      <Typography.H1>Total: {formatBTC(total)} BTC</Typography.H1>
    </form>
  )
}
