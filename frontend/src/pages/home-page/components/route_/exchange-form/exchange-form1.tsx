import React, { ComponentPropsWithoutRef, FC, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import { zodResolver } from '@hookform/resolvers/zod'
import { clsx } from 'clsx'
import { ethers } from 'ethers'
import { z } from 'zod'

import { ControlInput } from '~/pages/home-page/components/route_/exchange-form/control-input/control-input'
import { Swap } from '~/pages/home-page/components/route_/exchange-form/swap'
import { appActions } from '~/services/app'
import { useHtlcInInitMutation, useHtlcOutInitMutation } from '~/services/htlc'
import { htlcActions } from '~/services/htlc/htlc.slice'
import { useAppDispatch, useAppSelector } from '~/services/store'
import { Button } from '~/shared/button'
import IconReverse from '~/shared/icons/IconsReverse'
import { Loader } from '~/shared/loader'
import { Select } from '~/shared/select'
import Typography from '~/shared/typography/typography'
import { statusData, unit } from '~/shared/variables'

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
export const ExchangeForm1: FC<Props> = ({ className, ...rest }) => {
  const [htlcInInit, { isLoading: htlcInInitLoading }] = useHtlcInInitMutation()
  const [htlcOutInit, { isLoading: htlcOutInitLoading }] = useHtlcOutInitMutation()
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
  const [inputWidthGive, setInputWidthGive] = useState<null | number>(null)
  const [beforeDot, setBeforeDot] = useState(null)
  const [afterDot, setAfterDot] = useState(null)

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setFocus,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      destination: '',
      get: amount,
      give: amount,
      source: '',
    },
    mode: 'onChange',
    resolver: zodResolver(exchangeFormSchema),
  })

  const onSubmit = (formData: FormValues) => {
    setExchangeFormDisabled(true)
    dispatch(appActions.setExchangeAmount({ amount: formData.give }))

    const payload = {
      amount: Math.round(parseFloat(formData.give) * 100000000),
      token: give.toLowerCase(),
    }

    give === 'LN-BTC' ? htlcInInit(payload) : htlcOutInit(payload)
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
    // let inputValue = event.target.value
    //
    // // Удаляем все символы, кроме цифр и точки
    // inputValue = inputValue.replace(/[^\d.]/g, '')
    //
    // // Разрешаем только одну точку
    // inputValue = inputValue.replace(/(\..*)\./g, '$1')
    //
    // // Удаляем ведущие нули перед точкой, кроме нуля перед точкой в десятичных числах
    // inputValue = inputValue.replace(/^0+(?!\.|$)/, '')
    //
    // // Проверяем, является ли введенное значение числом с плавающей запятой
    // const isFloat = /^\d*\.?\d*$/.test(inputValue)
    //
    // if (isFloat) {
    //   setValue('give', inputValue)
    //   setValue('get', inputValue)
    //   // Определяем индекс точки в строке
    //   const dotIndex = inputValue.indexOf('.')
    //
    //   // Создаем две части строки
    //   const newBeforeDot = inputValue.substring(0, dotIndex + 3)
    //
    //   setBeforeDot(newBeforeDot)
    //   console.log('newBeforeDot:', newBeforeDot)
    //
    //   const newAfterDot = inputValue.substring(dotIndex + 3)
    //
    //   setAfterDot(newAfterDot)
    // }
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

  return (
    <form className={clsx(s.ExchangeFormRoot, className)} onSubmit={handleSubmit(onSubmit)}>
      <Typography.Error className={s.ExchangeFormError}>
        {errors?.give?.message || ''}
      </Typography.Error>
      <div className={s.ExchangeFormInputsWrapper}>
        <Select
          className={s.ExchangeFormAmountSelect}
          handleFocus={handleFocusGive}
          inputValue={watch('give')}
          isFocused={isInputFocused !== 'give'}
          isSelectBlocked={isExchangeFormDisabled}
          name={'give'}
          value={give}
        >
          <Typography.Label className={s.ExchangeFormAmountLabelInputSelect}>Give</Typography.Label>
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
            setInputWidth={setInputWidthGive}
          />
          {(beforeDot || afterDot) && (
            <div
              className={s.inputOverlay}
              style={{ maxWidth: inputWidthGive ? `${inputWidthGive}px` : undefined }}
            >
              <span className={s.whiteText}>{beforeDot === '0' ? '0' : beforeDot}</span>
              <span className={s.blueText}>{afterDot}</span>
            </div>
          )}
        </Select>
        <Button
          className={s.ExchangeFormReverseButton}
          disabled={isExchangeFormDisabled}
          onClick={handleReverse}
          type={'button'}
          variant={'default'}
        >
          <IconReverse />
        </Button>
        <Select
          className={s.ExchangeFormAmountSelect}
          handleFocus={handleFocusGet}
          inputValue={watch('get')}
          isFocused={isInputFocused === 'get'}
          isSelectBlocked={isExchangeFormDisabled}
          name={'get'}
          value={get}
        >
          <Typography.Label className={s.ExchangeFormAmountLabelInputSelect}>Get</Typography.Label>
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
            style={{ color: 'white' }}
          />
        </Select>
      </div>
      {/*<div className={s.ExchangeFormDestinationWrapper}>*/}
      {/*  <Typography.Label className={s.ExchangeFormDestinationLabelInputSelect}>*/}
      {/*    Source*/}
      {/*  </Typography.Label>*/}
      {/*  {isMetaMaskConnected && !isAlbyConnected && (*/}
      {/*    <Typography.Error className={s.ExchangeFormError}>Alby not connected!</Typography.Error>*/}
      {/*  )}*/}
      {/*  {!isMetaMaskConnected && isAlbyConnected && (*/}
      {/*    <Typography.Error className={s.ExchangeFormError}>*/}
      {/*      MetaMask not connected!*/}
      {/*    </Typography.Error>*/}
      {/*  )}*/}
      {/*  <ControlInput*/}
      {/*    autoComplete={'off'}*/}
      {/*    className={s.ExchangeFormDestinationInput}*/}
      {/*    control={control}*/}
      {/*    disabled={isExchangeFormDisabled}*/}
      {/*    name={'source'}*/}
      {/*    onBlur={handleInputBlur}*/}
      {/*    onChange={handleInputChange}*/}
      {/*    onFocus={handleToInputFocus}*/}
      {/*    value={'Source'}*/}
      {/*  />*/}

      {/*  <Typography.Label className={s.ExchangeFormDestinationLabelInputSelect}>*/}
      {/*    Destination*/}
      {/*  </Typography.Label>*/}
      {/*  {isMetaMaskConnected && !isAlbyConnected && (*/}
      {/*    <Typography.Error className={s.ExchangeFormError}>Alby not connected!</Typography.Error>*/}
      {/*  )}*/}
      {/*  {!isMetaMaskConnected && isAlbyConnected && (*/}
      {/*    <Typography.Error className={s.ExchangeFormError}>*/}
      {/*      MetaMask not connected!*/}
      {/*    </Typography.Error>*/}
      {/*  )}*/}
      {/*  <ControlInput*/}
      {/*    autoComplete={'off'}*/}
      {/*    className={s.ExchangeFormDestinationInput}*/}
      {/*    control={control}*/}
      {/*    disabled={isExchangeFormDisabled}*/}
      {/*    name={'destination'}*/}
      {/*    onBlur={handleInputBlur}*/}
      {/*    onChange={handleInputChange}*/}
      {/*    onFocus={handleToInputFocus}*/}
      {/*    value={'Destination'}*/}
      {/*  />*/}
      {/*</div>*/}
      {!isExchangeFormDisabled && (
        <Button
          className={s.ExchangeSubmitButton}
          disabled={!!disabledSubmitButton}
          variant={'primary'}
        >
          Give
        </Button>
      )}
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
      {amount && !htlcInInitLoading && !htlcOutInitLoading && (
        <Swap handleFormReset={handleFormReset} />
      )}
    </form>
  )
}
