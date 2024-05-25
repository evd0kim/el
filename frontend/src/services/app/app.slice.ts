import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { RouteData, lnBtc } from '~/shared/variables/variables'

export const balanceKeyMetaMask = {
  eth: 'eth',
  sats: 'btc',
} as const

type BalanceKeyMetaMask = 'btc' | 'eth'

type BalanceMetaMask = {
  currency: 'BTC' | 'ETH'
  value: string
}

type InitialState = {
  exchange: {
    amount: string
    destination: string
    get: string
    give: string
    network: null | string
    source: string
  }
}

const initialState: InitialState = {
  exchange: {
    amount: '',
    destination: '',
    get: RouteData.exchangeForm.selectValues[1].title,
    give: RouteData.exchangeForm.selectValues[0].title,
    network: null,
    source: '',
  },
}

const slice = createSlice({
  initialState,
  name: 'app',
  reducers: {
    reverseExchange: state => {
      const { get, give } = state.exchange

      state.exchange.give = get
      state.exchange.get = give
    },
    setExchangeAmount: (state, action: PayloadAction<{ amount: string }>) => {
      state.exchange.amount = action.payload.amount
    },
    setExchangeFrom: (state, action: PayloadAction<{ give: string }>) => {
      if (state.exchange.get === action.payload.give) {
        slice.caseReducers.reverseExchange(state)
      } else if (action.payload.give !== lnBtc && state.exchange.get !== lnBtc) {
        state.exchange.get = lnBtc
        state.exchange.give = action.payload.give
      } else {
        state.exchange.give = action.payload.give
      }
    },
    setExchangeTo: (state, action: PayloadAction<{ get: string }>) => {
      if (state.exchange.give === action.payload.get) {
        slice.caseReducers.reverseExchange(state)
      } else if (action.payload.get !== lnBtc && state.exchange.give !== lnBtc) {
        state.exchange.give = lnBtc
        state.exchange.get = action.payload.get
      } else {
        state.exchange.get = action.payload.get
      }
    },
    setNetwork: (state, action: PayloadAction<{ network: string }>) => {
      state.exchange.network = action.payload.network
    },
  },
})

export const appReducer = slice.reducer
export const appActions = slice.actions
