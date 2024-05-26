import React, { ComponentPropsWithoutRef, FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { clsx } from 'clsx'
import { addDays, addYears } from 'date-fns'
import { ethers, formatUnits, parseUnits } from 'ethers'
import { z } from 'zod'

import { ControlInput } from '~/pages/home-page/components/route_/exchange-form/control-input/control-input'
import { appActions } from '~/services/app'
import { htlcActions } from '~/services/htlc/htlc.slice'
import { useAppDispatch, useAppSelector } from '~/services/store'
import { Button } from '~/shared/button'
import { NewSelect } from '~/shared/new-select/new-select'
import Typography from '~/shared/typography/typography'
import { formData, networks, statusData, unit } from '~/shared/variables'
import s from './form.module.scss'
import { ELTToken } from '~/services/contract'
import { metaMaskAsyncActions } from '~/services/meta-mask'
import { toast } from 'react-toastify'

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
  const { address, burnable } = useAppSelector(state => state.metaMask)
  const { status: metaMaskStatus } = useAppSelector(state => state.metaMask)
  const [isExchangeFormDisabled, setExchangeFormDisabled] = useState<boolean>(false)
  const isMetaMaskConnected = metaMaskStatus === statusData.succeeded
  const network = useAppSelector(state => state.app.exchange.network)
  const [disabledSubmitButton, setDisabledSubmitButton] = useState<boolean>(false)

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

  async function executeMintOperation(amountToMint: string, lockDate: Date) {
    try {
      console.log('Initializing contract and signer');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (network) {
        // Инициализация контрактов
        const collateralTokenAddress = networks[network].tokenContract;
        const elTokenAddress = networks[network].elTokenAddress;
        const collateralToken = new ethers.Contract(collateralTokenAddress, ELTToken.abi, signer);
        const elToken = new ethers.Contract(elTokenAddress, ELTToken.abi, signer);

        // Получаем баланс пользователя
        const balance = await collateralToken.balanceOf(address);
        const formattedBalance = formatUnits(balance, Number(networks[network].decimalsToken));

        // Проверка баланса
        const amount = parseUnits(amountToMint, Number(networks[network].decimalsToken));
        if (Number(balance) < Number(amount)) {
          console.error('Not enough balance to perform mint');
          alert('Not enough balance to perform mint');
          return; // Прерываем выполнение, если недостаточно средств
        }

        // Утверждение средств для mint функции
        console.log(`Approving ELToken (${elTokenAddress}) to spend ${amountToMint} on behalf of ${address}`);
        const approveTx = await collateralToken.approve(elTokenAddress, amount);
        await approveTx.wait();
        console.log('Approval transaction completed.');

        // Вычисление lockUntil
        const lockUntil = Math.floor(lockDate.getTime() / 1000);

        // Вызов функции mint
        console.log(`Calling mint on ELToken (${elTokenAddress}) with amount: ${amount.toString()} and lockUntil: ${lockUntil}`);
        const mintTx = await elToken.mint(amount, lockUntil);
        await mintTx.wait();
        console.log('Mint transaction completed.');
        toast.info(`Mint transaction completed.`, {
          draggable: false,
          progressStyle: { background: 'var(--color-accent-lime)' },
        })
        reset();
      }
    } finally {
      dispatch(metaMaskAsyncActions.fetchMetaMaskBalance());
      setDisabledSubmitButton(false);
    }
  }

  const onSubmit = async (formData: FormValues) => {
    setDisabledSubmitButton(true)
    const amountToMint = formData[inputLiquidity.name]
    const lockDate = new Date(formData[inputData.name])
    if (typeof amountToMint === 'string') {
      console.log(amountToMint)
      executeMintOperation(amountToMint, lockDate).catch(console.error)
    }
  }

  const onBurnHandler = () => {
    console.log('logic for burn')
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

  const calculateInputValue = (variant: any) => {
    switch (variant) {
      case 'wBTC':
        return `MetaMask${address ? `: ${address}` : ''}`
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
      <div className={s.SelectWrapper}>
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
      <div className={s.InputWrapper}>
        <Typography.Error className={s.FormError}>
          {!isMetaMaskConnected ? 'MetaMask not connected!' : ''}
        </Typography.Error>
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
      <div className={s.ButtonsWrapper}>
        <Button disabled={disabledSubmitButton}>Mint</Button>
        <Button disabled={Number(burnable.value) <= 0} type={'button'} onClick={onBurnHandler}>
          Burn
        </Button>
      </div>
      <Typography.H3>Total: {formatBTC(total)} BTC</Typography.H3>
      <Typography.Body2>{`Burnable: ${burnable.value} ${burnable.currency}`}</Typography.Body2>
    </form>
  )
}
