import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit/react'

import { AppDispatch, RootState } from '~/services/store'
import { currencyData, statusData } from '~/shared/variables/variables'

export type Balance = {
  currency: 'sats'
  value: string
}

type Status = (typeof statusData)[keyof typeof statusData]

type InitialState = {
  balance: Balance[]
  isEnable: boolean
  status: Status
}

const initialState: InitialState = {
  balance: [],
  isEnable: false,
  status: statusData.idle,
}

const fetchAlbyBalance = createAsyncThunk<void, void, { dispatch: AppDispatch; state: RootState }>(
  'alby/fetchAlbyBalance',
  async (_, { dispatch, getState }) => {
    //dispatch(albyActions.setAlbyStatus({ status: statusData.loading }))
    console.log('fetchAlbyBalance')
    try {
      if (window.webln !== undefined) {
        // await window.webln.enable()
        const isAlbyEnable = getState().alby.isEnable

        console.log('isAlbyEnable', isAlbyEnable)
        if (typeof window.webln.getBalance === 'function') {
          const info = await window.webln.getBalance()
          const balance: Balance = { currency: currencyData.sats, value: info.balance.toString() }

          dispatch(albyActions.setAlbyBalance({ balance }))
          dispatch(albyActions.setAlbyStatus({ status: statusData.succeeded }))
        }
      } else {
        dispatch(albyActions.setAlbyStatus({ status: statusData.failed }))
      }
    } catch (error) {
      dispatch(albyActions.setAlbyStatus({ status: statusData.failed }))
      throw error
    }
  }
)

const slice = createSlice({
  extraReducers: builder => {
    builder.addCase(fetchAlbyBalance.pending, state => {
      // state.status = statusData.loading
    })
  },
  initialState,
  name: 'alby',
  reducers: {
    setAlbyBalance: (state, action: PayloadAction<{ balance: Balance }>) => {
      state.balance[0] = action.payload.balance
    },
    setAlbyIsEnable: (state, action: PayloadAction<{ isEnable: boolean }>) => {
      state.isEnable = action.payload.isEnable
    },
    setAlbyStatus: (state, action: PayloadAction<{ status: Status }>) => {
      state.status = action.payload.status
    },
  },
})

export const albyReducer = slice.reducer
export const albyActions = slice.actions

export const albyAsyncActions = { fetchAlbyBalance }
