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
    if (!window?.ethereum?.isMetaMask || network) {
      dispatch(metaMaskActions.setMetaMaskStatus({ status: statusData.failed }))

      return
    }

    try {
      const chainId = await getChainId()

      dispatch(appActions.setNetwork({ network: chainId }))
      const chainIdTarget: string = networks[chainId]?.chainId

      if (chainId === chainIdTarget) {
        toast.info(`MetaMask connected to the ${networks[chainId].name}`, {
          draggable: false,
          progressStyle: { background: 'var(--color-accent-lime)' },
        })
      } else {
        toast.info('Wrong network. Please, switch', {
          draggable: false,
          progressStyle: { background: 'var(--color-accent-lime)' },
        })
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
