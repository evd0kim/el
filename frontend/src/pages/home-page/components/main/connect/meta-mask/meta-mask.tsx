import { useEffect } from 'react'
import { toast } from 'react-toastify'

import { DisplayWalletInfo } from '~/pages/home-page/components/main/connect/display-wallet-info'
import { appActions } from '~/services/app'
import { getChainId, metaMaskActions, metaMaskAsyncActions } from '~/services/meta-mask'
import {
  subscribeToMetaMaskEvents,
  unSubscribeFromMetaMaskEvents,
} from '~/services/meta-mask/meta-mask.service'
import { useAppDispatch, useAppSelector } from '~/services/store'
import { connectData, networks, statusData } from '~/shared/variables/variables'

export const MetaMask = () => {
  const dispatch = useAppDispatch()
  const { nameMetaMask } = connectData.info
  const network = useAppSelector(state => state.app.exchange.network)

  const connectMetaMask = async () => {
    console.log('connectMetaMask ')
    if (!window?.ethereum?.isMetaMask || network) {
      console.log('connected')
      dispatch(metaMaskActions.setMetaMaskStatus({ status: statusData.failed }))

      return
    }

    try {
      const chainId = await getChainId()

      console.log('getChainId1', chainId)

      dispatch(appActions.setNetwork({ network: chainId }))
      console.log('chainIdTarget2', networks)
      const chainIdTarget: string = networks[chainId]?.chainId

      console.log('chainIdTarget3', chainIdTarget)

      if (chainId === chainIdTarget) {
        console.log('test', chainIdTarget)
        toast.info(`MetaMask connected to the ${networks[chainId].name}`, {
          draggable: false,
          progressStyle: { background: 'var(--color-accent-lime)' },
        })
      } else {
        toast.info('Wrong network. Please, switch', {
          draggable: false,
          progressStyle: { background: 'var(--color-accent-lime)' },
        })
        // const res = await window.ethereum.request({
        //   method: 'wallet_switchEthereumChain',
        //   params: [
        //     {
        //       chainId: '0x',
        //     },
        //   ],
        // })
      }

      dispatch(metaMaskAsyncActions.fetchMetaMaskBalance())
    } catch (error) {
      dispatch(metaMaskActions.setMetaMaskStatus({ status: statusData.failed }))
      console.error('Error fetching MetaMask balance:', error)
    }
  }

  useEffect(() => {
    dispatch(metaMaskActions.setMetaMaskStatus({ status: statusData.loading }))

    subscribeToMetaMaskEvents(connectMetaMask)
    ;(async () => {
      await connectMetaMask()
    })()

    return () => {
      unSubscribeFromMetaMaskEvents(connectMetaMask)
    }
  }, [])

  const handleConnectMetaMask = () => {
    ;(async () => {
      await connectMetaMask()
    })()
  }

  return <DisplayWalletInfo onClick={handleConnectMetaMask} variant={nameMetaMask} />
}
