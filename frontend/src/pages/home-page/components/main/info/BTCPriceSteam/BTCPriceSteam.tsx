import { useEffect } from 'react'

import { baseApi } from '~/services/base-api'
import { useGetRatesQuery } from '~/services/market'
import { useAppDispatch, useAppSelector } from '~/services/store'
import Typography from '~/shared/typography/typography'

import 'react-loading-skeleton/dist/skeleton.css'

import s from './BTCPriseSteam.module.scss'

type Props = {
  inputValue: string
}

export const BTCPriceStream = ({ inputValue }: Props) => {
  const { amount } = useAppSelector(state => state.app.exchange)
  // const [trigger, { data }] = baseApi.endpoints.getRates.useLazyQuery()
  const { data, isLoading, refetch } = useGetRatesQuery()
  const bitcoinPriceUSD = data?.data.find(item => item.asset === 'btc')?.PriceUSD
  const network = useAppSelector(state => state.app.exchange.network)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (network) {
      refetch()
      console.log('Fetching rates for network')
    }
  }, [network])

  const handleNetworkChange = async (selectedNetwork: any) => {
    // Логика обработки изменения сети
  }

  // useEffect(() => {
  //   // TODO данные берем с Binance подходит ли нам это?
  //   const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade')
  //
  //   ws.onopen = () => {
  //     // console.log('WebSocket connection opened')
  //   }
  //
  //   ws.onmessage = (event: MessageEvent<string>) => {
  //     const eventData = JSON.parse(event.data)
  //     const newPrice = eventData.p
  //
  //     setPrice(newPrice)
  //   }
  //   ws.onclose = () => {
  //     // console.log('WebSocket connection closed')
  //   }
  //
  //   return () => {
  //     ws.close()
  //   }
  // }, [])

  // console.log(typeof inputValue)

  const calculatedPriceWithSpaces = () => {
    if (bitcoinPriceUSD) {
      const calculatedPrice = Math.floor(
        parseFloat(inputValue || amount || '0') * parseFloat(bitcoinPriceUSD.toString())
      )

      return calculatedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }
  }

  return (
    <>
      {bitcoinPriceUSD && (inputValue || amount) && (
        <Typography.Body2 className={s.InfoUsd}>
          {'\u00A0•'} {calculatedPriceWithSpaces()} USD
        </Typography.Body2>
      )}
    </>
  )
}
