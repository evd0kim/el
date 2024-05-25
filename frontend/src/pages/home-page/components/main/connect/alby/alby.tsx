import React, { useEffect } from 'react'

import { DisplayWalletInfo } from '~/pages/home-page/components/main/connect/display-wallet-info'
import {
  albyActions,
  albyAsyncActions,
  connectToAlby,
  subscribeToAlbyEvents,
  unSubscribeFromAlbyEvents,
} from '~/services/alby'
import { useAppDispatch, useAppSelector } from '~/services/store'
import { connectData, statusData } from '~/shared/variables'

export const Alby = () => {
  const dispatch = useAppDispatch()
  const { nameAlby } = connectData.info

  const connectAlby = async () => {
    dispatch(albyActions.setAlbyStatus({ status: statusData.loading }))
    try {
      const isAlbyEnable = await connectToAlby()

      if (isAlbyEnable) {
        dispatch(albyActions.setAlbyIsEnable({ isEnable: true }))
        await dispatch(albyAsyncActions.fetchAlbyBalance())
      } else {
        dispatch(albyActions.setAlbyIsEnable({ isEnable: false }))
        dispatch(albyActions.setAlbyStatus({ status: statusData.failed }))
      }
    } catch (error) {
      dispatch(albyActions.setAlbyStatus({ status: statusData.failed }))
      console.error('Error fetching Alby balance:', error)
    }
  }

  useEffect(() => {
    subscribeToAlbyEvents(connectAlby)
    ;(async () => {
      await connectAlby()
    })()

    return () => {
      unSubscribeFromAlbyEvents(connectAlby)
    }
  }, [])

  return <DisplayWalletInfo onClick={connectAlby} variant={nameAlby} />
}
