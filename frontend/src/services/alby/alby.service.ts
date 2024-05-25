import type { GetBalanceResponse, GetInfoResponse, MakeInvoiceResponse } from '@webbtc/webln-types'

import { Balance, albyActions } from '~/services/alby/alby.slice'
import { currencyData, statusData } from '~/shared/variables'
interface ExtendedMakeInvoiceResponse extends MakeInvoiceResponse {
  rHash: string
}

export const subscribeToAlbyEvents = async (handler: () => void) => {
  if (!window?.webln?.on) {
    console.log('Not supported')
  }

  await window?.webln?.enable()
  console.log('On event listener')
  /*  window?.addEventListener('webln:change', accountChangedHandler)*/
  window?.webln?.on('accountChanged', handler)
}

export const unSubscribeFromAlbyEvents = (handler: () => void) => {
  // window?.removeEventListener('webln:change', handler)
  window?.webln?.off('accountChanged', handler)
}

export const connectToAlby = async () => {
  if (typeof window !== 'undefined' && window.webln !== undefined) {
    try {
      await window.webln.enable()

      return true
    } catch (error) {
      console.error('Error connecting to Alby:', error)

      return false
    }
  } else {
    // throw new Error('Alby extension is not available!')
    console.error('Alby extension is not available!')

    return false
  }
}

export const getBalanceAlby = async () => {
  if (
    typeof window !== 'undefined' &&
    window.webln !== undefined &&
    typeof window.webln.getBalance === 'function'
  ) {
    console.log('getBalance')
    const info = await window.webln.getBalance()

    console.log('info', info)

    return info
  } else {
    return false
  }
}

export const makeInvoiceAlby = async (amount: string) => {
  if (window.webln !== undefined) {
    await window.webln.enable()
    if (typeof window.webln.getBalance === 'function') {
      return (await window.webln.makeInvoice({
        amount: amount,
      })) as ExtendedMakeInvoiceResponse
    }
  }
}

export const sendPaymentAlby = async (invoice: string) => {
  if (window.webln !== undefined) {
    await window.webln.enable()
    if (typeof window.webln.getBalance === 'function') {
      return await window.webln.sendPayment(invoice)
    }
  }
}
