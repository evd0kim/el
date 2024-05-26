import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit/react'

import { balanceKeyMetaMask } from '~/services/app'
import {
  getAccountsMetaMask,
  getAddressMetaMask, getBalanceElToken,
  getBalanceEthMetaMask,
  getBalanceWbtcMetaMask,
  makeContractMetaMask,
} from '~/services/meta-mask/meta-mask.service'
import { AppDispatch, RootState } from '~/services/store'
import { currencyData, networks, statusData } from '~/shared/variables/variables'
import { ethers, formatUnits } from 'ethers'
import { ELTToken } from '~/services/contract'

type BalanceKey = 'btc' | 'eth'

type Balance = {
  currency: string
  value: string
}

type Status = (typeof statusData)[keyof typeof statusData]

type InitialState = {
  address: string
  balance: Balance[]
  status: Status
  burnable: Balance
}

const initialState: InitialState = {
  address: '',
  balance: [],
  status: statusData.idle,
  burnable: {value: '0',  currency: 'BTC'}
}

const fetchMetaMaskBalance = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>('meta-mask/fetchAlbyBalance', async (_, { dispatch, getState }) => {
  try {
    const state = getState()
    const network = state.app.exchange.network
    const account = await getAccountsMetaMask()
    const balanceEth = await getBalanceEthMetaMask(account)

    if (network) {
      const payloadEth = { currency: networks[network].currency, value: balanceEth }

      dispatch(
        metaMaskActions.setMetaMaskBalance({ balance: payloadEth, key: balanceKeyMetaMask.eth })
      )

      const { contract, signer } = await makeContractMetaMask(network)
      const address = await getAddressMetaMask(signer)

      dispatch(metaMaskActions.setMetaMaskAddress({ address }))
      const newBalanceSats = await getBalanceWbtcMetaMask(contract, account)
      const payloadSats = { currency: currencyData.wbtc, value: newBalanceSats }

      // TODO сделать типизацию и обработку ошибок
      dispatch(
        metaMaskActions.setMetaMaskBalance({ balance: payloadSats, key: balanceKeyMetaMask.sats })
      )

      const elContract = new ethers.Contract(networks[network].elTokenAddress, ELTToken.abi, signer)
      const balanceElToken = await getBalanceElToken(elContract, account)
      dispatch(
        metaMaskActions.setBurnBalance({ burnable: { value: balanceElToken, currency: 'BTC' } })
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
    setBurnBalance: (state, action: PayloadAction<{ burnable: Balance }>) => {
      state.burnable = action.payload.burnable
    },
  },
})

export const metaMaskReducer = slice.reducer
export const metaMaskActions = slice.actions

export const metaMaskAsyncActions = { fetchMetaMaskBalance }
