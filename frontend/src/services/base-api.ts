// import { createApi, fetchBaseQuery, useBaseQuerySubscription } from '@reduxjs/toolkit/query/react'
//
// import { networks } from '~/shared/variables'

// export const baseApi = createApi({
//   baseQuery: (arg, { getState }, api) => {
//     // const network = 'linea'
//     const network = networks[getState().app.exchange.network]
//     // const network = 'linea.'
//     const part = network ? network : ''
//     const baseUrl = import.meta.env.VITE_BASE_URL
//
//     console.log('state', getState().app.exchange.network)
//     console.log('baseUrl', baseUrl)
//
//     return fetchBaseQuery({
//       baseUrl: `https://${part}${baseUrl}`,
//     })(arg, { getState }, api) // Вызываем fetchBaseQuery с аргументами arg и api
//   },
//   // baseQuery: fetchBaseQuery({
//   //   baseUrl: `https://linea.${import.meta.env.VITE_BASE_URL}`,
//   // }),
//   endpoints: () => ({}),
//   reducerPath: 'baseApi',
//   tagTypes: ['htlc'],
// })

// import { useEffect } from 'react'
// import { useSelector } from 'react-redux'
//
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
//
// import { networks } from '~/shared/variables'
//
// export const baseApi = createApi({
//   baseQuery: (arg, { getState }, api) => {
//     const { network } = getState().app.exchange
//     const baseUrl = import.meta.env.VITE_BASE_URL
//     const part = networks[network] ? `${networks[network]}.` : ''
//
//     console.log('state', network)
//     console.log('baseUrl', baseUrl)
//
//     return fetchBaseQuery({
//       baseUrl: `https://${part}${baseUrl}`,
//     })(arg, { getState }, api)
//   },
//   endpoints: () => ({}),
//   reducerPath: 'baseApi',
//   tagTypes: ['htlc'],
// })
//
// // Используем useEffect для подписки на изменения состояния и обновления базового запроса
// export function useBaseApiSubscription() {
//   const network = useSelector((state: RootState) => state.app.exchange.network)
//
//   useEffect(() => {
//     const baseUrl = import.meta.env.VITE_BASE_URL
//     const part = networks[network] ? `${networks[network]}.` : ''
//
//     baseApi.injectEndpoints({
//       endpoints: {},
//       overrideExisting: true,
//     })
//
//     baseApi.setBaseQuery(
//       fetchBaseQuery({
//         baseUrl: `https://${part}${baseUrl}`,
//       })
//     )
//   }, [network])
// }

import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react'

import { HtlcOutSetRequest, HtlcOutSetResponse } from '~/services/htlc'
import { htlcActions } from '~/services/htlc/htlc.slice'
import { RatesResponse } from '~/services/market'
import { RootState } from '~/services/store'
import { networks } from '~/shared/variables'
const selectNetwork = (state: RootState) => state.app.exchange.network

const rawBaseQuery = fetchBaseQuery({
  baseUrl: 'https://',
})

const dynamicBaseQuery: BaseQueryFn<FetchArgs | string, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const networkId = selectNetwork(api.getState() as RootState)
  const partStateUrl = networkId ? networks[networkId].partUrl : ''
  //const projectId = `linea.${import.meta.env.VITE_BASE_URL}`

  if (!networkId) {
    return {
      error: {
        data: 'No project ID received',
        status: 400,
        statusText: 'Bad Request',
      },
    }
  }

  const urlEnd = typeof args === 'string' ? args : args.url
  const adjustedUrl = `/${partStateUrl}${import.meta.env.VITE_BASE_URL}${urlEnd}`
  const adjustedArgs = typeof args === 'string' ? adjustedUrl : { ...args, url: adjustedUrl }

  return rawBaseQuery(adjustedArgs, api, extraOptions)
}

export const baseApi = createApi({
  baseQuery: dynamicBaseQuery,
  endpoints: () => ({}),
  reducerPath: 'baseApi',
  tagTypes: ['htlc'],
})

// const rawBaseQuery = fetchBaseQuery({
//   baseUrl: 'import.meta.env.VITE_BASE_URL',
// })
//
// const dynamicBaseQuery: BaseQueryFn<FetchArgs | string, unknown, FetchBaseQueryError> = async (
//   args,
//   api,
//   extraOptions
// ) => {
//   const state = api.getState() as RootState
//   let part = 'linea.'
//
//   if (state.app.exchange.network) {
//     part = networks[state?.app?.exchange?.network].partUrl
//   }
//   const baseUrl = import.meta.env.VITE_BASE_URL
//
//   console.log('part', part)
//
//   if (!part) {
//     return {
//       error: {
//         data: 'No project ID received',
//         status: 400,
//         statusText: 'Bad Request',
//       },
//     }
//   }
//
//   // provide the amended url and other params to the raw base query
//   return rawBaseQuery(`https://${part}${baseUrl}`, api, extraOptions)
// }
//
// export const baseApi = createApi({
//   baseQuery: dynamicBaseQuery,
//   endpoints: builder => ({
//     htlcOutSet: builder.mutation<HtlcOutSetResponse, HtlcOutSetRequest>({
//       // invalidatesTags: ['Decks'],
//       async onQueryStarted(args, { dispatch, queryFulfilled }) {
//         try {
//           const { data: htlcOutSet } = await queryFulfilled
//
//           await queryFulfilled
//           dispatch(htlcActions.setHtlcOutSetRequest({ request: args }))
//           dispatch(htlcActions.setHtlcOutSetResponse({ response: htlcOutSet }))
//         } catch (e) {
//           console.log(e)
//         }
//       },
//       query: args => {
//         return {
//           body: args,
//           method: 'POST',
//           url: `/htlc/out/set`,
//         }
//       },
//     }),
//   }),
// })

// export const baseApi = createApi({
//   baseQuery: dynamicBaseQuery,
//   endpoints: () => ({}),
//   reducerPath: 'baseApi',
//   tagTypes: ['htlc'],
// })

// export const baseApi = createApi({
//   baseQuery: fetchBaseQuery({
//     baseUrl: `https://linea.${import.meta.env.VITE_BASE_URL}`,
//   }),
//   endpoints: () => ({}),
//   reducerPath: 'baseApi',
//   tagTypes: ['htlc'],
// })
