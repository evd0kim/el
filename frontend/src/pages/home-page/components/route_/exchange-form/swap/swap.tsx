import { useEffect, useState } from 'react'

import {
  subscribeToContractEvents,
  unSubscribeToContractEvents,
} from '~/services/contract/contract-service'
import { htlcActions } from '~/services/htlc/htlc.slice'
import { useAppDispatch, useAppSelector } from '~/services/store'
import { networks } from '~/shared/variables'

type Props = {
  handleFormReset: () => void
}

export const Swap = ({ handleFormReset }: Props) => {
  const dispatch = useAppDispatch()
  const exchange = useAppSelector(state => state.app.exchange)
  const { get, give } = exchange
  const network = useAppSelector(state => state.app.exchange.network)
  const contractAddress = network ? networks[network].contractAddress : ''

  const eventHandler = (from: any) => {
    console.log(from)
    if (from.log.fragment.name) {
      dispatch(htlcActions.setEventName({ eventName: from.log.fragment.name }))
    }
  }

  useEffect(() => {
    subscribeToContractEvents(eventHandler, contractAddress)
      .then(() => console.log('Subscribed to events'))
      .catch((error: any) => console.error('Error setting up events:', error))

    return () => {
      unSubscribeToContractEvents(eventHandler, contractAddress)
        .then(() => console.log('Unsubscribed from events'))
        .catch((error: any) => console.error('Error unsubscribing from events:', error))
    }
  }, [])

  return (
    <>
      {/*{give === 'wBTC' && get === 'LN-BTC' && <WbtcToLn handleFormReset={handleFormReset} />}*/}
      {/*{give === 'LN-BTC' && get === 'wBTC' && <LnToWbtc handleFormReset={handleFormReset} />}*/}
    </>
  )
}
