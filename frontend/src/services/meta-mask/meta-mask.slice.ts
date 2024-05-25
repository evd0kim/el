import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit/react'
import { ethers } from 'ethers'

import { balanceKeyMetaMask } from '~/services/app'
import { ERC20ABI } from '~/services/contract/erc20-abi'
import {
  getAccountsMetaMask,
  getAddressMetaMask,
  getBalanceEthMetaMask,
  getBalanceWbtcMetaMask,
  getChainId,
  makeContractMetaMask,
} from '~/services/meta-mask/meta-mask.service'
import { AppDispatch, RootState } from '~/services/store'
import { formatBalance, substrBalance } from '~/shared/functions/functions'
import { currencyData, networks, statusData } from '~/shared/variables/variables'

export const balanceKey = {
  eth: 'eth',
  sats: 'btc',
} as const

type BalanceKey = 'btc' | 'eth'

type Balance = {
  currency: 'ETH' | 'SepoliaETH' | 'wBTC'
  value: string
}

type Status = (typeof statusData)[keyof typeof statusData]

type InitialState = {
  address: string
  balance: Balance[]
  status: Status
}

const initialState: InitialState = {
  address: '',
  balance: [],
  status: statusData.idle,
}

const fetchMetaMaskBalance = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>('meta-mask/fetchAlbyBalance', async (_, { dispatch, getState }) => {
  try {
    console.log('fetchMetaMaskBalance')
    const state = getState()
    const network = state.app.exchange.network
    const account = await getAccountsMetaMask()

    console.log('1')
    const balanceEth = await getBalanceEthMetaMask(account)

    console.log('2')
    if (network) {
      const payloadEth = { currency: networks[network].currency, value: balanceEth }

      console.log('3')
      console.log(network)
      dispatch(
        metaMaskActions.setMetaMaskBalance({ balance: payloadEth, key: balanceKeyMetaMask.eth })
      )

      console.log('payloadEth', payloadEth)

      const { contract, signer } = await makeContractMetaMask(network)

      console.log('contract', contract)
      console.log('signer', signer)
      console.log('4')
      const address = await getAddressMetaMask(signer)

      console.log('5')
      dispatch(metaMaskActions.setMetaMaskAddress({ address }))

      console.log('6')
      const newBalanceSats = await getBalanceWbtcMetaMask(contract, account)

      console.log('7')
      const payloadSats = { currency: currencyData.wbtc, value: newBalanceSats }

      console.log('newBalanceSats', newBalanceSats)
      console.log('payloadSats', payloadSats)
      // TODO сделать типизацию и обработку ошибок
      dispatch(
        metaMaskActions.setMetaMaskBalance({ balance: payloadSats, key: balanceKeyMetaMask.sats })
      )
      dispatch(metaMaskActions.setMetaMaskStatus({ status: statusData.succeeded }))
    } else {
      dispatch(metaMaskActions.setMetaMaskStatus({ status: statusData.failed }))
    }
  } catch (error: any) {
    dispatch(metaMaskActions.setMetaMaskStatus({ status: statusData.failed }))
    throw error
  }
})

const slice = createSlice({
  extraReducers: builder => {
    builder.addCase(fetchMetaMaskBalance.pending, state => {
      // state.status = statusData.loading
    })
  },
  initialState,
  name: 'metaMask',
  reducers: {
    setMetaMaskAddress: (state, action: PayloadAction<{ address: string }>) => {
      state.address = action.payload.address
    },
    setMetaMaskBalance: (state, action: PayloadAction<{ balance: Balance; key: BalanceKey }>) => {
      if (action.payload.key === balanceKeyMetaMask.eth) {
        state.balance[0] = action.payload.balance
      } else {
        state.balance[1] = action.payload.balance
      }
    },
    setMetaMaskStatus: (state, action: PayloadAction<{ status: Status }>) => {
      state.status = action.payload.status
    },
  },
})

export const metaMaskReducer = slice.reducer
export const metaMaskActions = slice.actions

export const metaMaskAsyncActions = { fetchMetaMaskBalance }
