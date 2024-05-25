import React, { ComponentPropsWithoutRef, FC, useEffect, useState } from 'react'

import { BTCPriceStream } from '~/pages/home-page/components/main/info/BTCPriceSteam/BTCPriceSteam'
import { appActions } from '~/services/app'
import { useAppDispatch, useAppSelector } from '~/services/store'
import { NewSelect } from '~/shared/new-select/new-select'
import { networks } from '~/shared/variables'
type Props = ComponentPropsWithoutRef<'div'>

export const NetworkSelector: FC<Props> = ({ className, ...rest }) => {
  const dispatch = useAppDispatch()
  const network = useAppSelector(state => state.app.exchange.network)

  if (!network) {
    return
  }

  console.log('NETWORK', network)
  const { currency, name } = networks[network]

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
    <>
      {/*{network && <BTCPriceStream inputValue={'100'} />}*/}
      <NewSelect
        onChange={handleNetworkChange}
        options={Object.entries(networks).map(([key, network]) => ({
          [key]: network.name,
        }))}
        value={name}
      />
      <NewSelect
        onChange={handleNetworkChange}
        options={Object.entries(networks).map(([key, network]) => ({
          [key]: network.currency,
        }))}
        value={currency}
      />
    </>
  )
}
