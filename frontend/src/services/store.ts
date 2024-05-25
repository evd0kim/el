import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import { setupListeners } from '@reduxjs/toolkit/query'
import { configureStore } from '@reduxjs/toolkit/react'

// import { albyReducer } from '~/services/alby'
import { appReducer } from '~/services/app'
import { baseApi } from '~/services/base-api'
import { htlcReducer } from '~/services/htlc/htlc.slice'
import { metaMaskReducer } from '~/services/meta-mask'

export const store = configureStore({
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(baseApi.middleware),
  reducer: {
    app: appReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    htlc: htlcReducer,
    metaMask: metaMaskReducer,
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
setupListeners(store.dispatch)
