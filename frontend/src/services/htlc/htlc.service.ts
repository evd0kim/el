import { baseApi } from '~/services/base-api'
import { htlcActions } from '~/services/htlc/htlc.slice'
import {
  HtlcInInitRequestWithTarget,
  HtlcInInitResponse,
  HtlcInSetRequestTarget,
  HtlcInSetResponse,
  HtlcOutInitRequestWithTarget,
  HtlcOutInitResponse,
  HtlcOutSetRequest,
  HtlcOutSetRequestTarget,
  HtlcOutSetResponse,
} from '~/services/htlc/htlc.types'
import { selectNetwork } from '~/services/selectors'
import { RootState } from '~/services/store'
import { networks } from '~/shared/variables'

export const HtlcService = baseApi.injectEndpoints({
  endpoints: builder => {
    return {
      htlcInInit: builder.mutation<HtlcInInitResponse, HtlcInInitRequestWithTarget>({
        // invalidatesTags: ['Decks'],
        async onQueryStarted({ targetNetwork, ...args }, { dispatch, getState, queryFulfilled }) {
          try {
            const { data: htlcInInit } = await queryFulfilled

            await queryFulfilled
            dispatch(htlcActions.setHtlcInInitRequest({ request: args }))
            dispatch(htlcActions.setHtlcInInitResponse({ response: htlcInInit }))
          } catch (e) {
            console.log(e)
          }
        },
        query: ({ targetNetwork, ...args }) => {
          return {
            body: args,
            method: 'POST',
            url: `/htlc/${targetNetwork}/in/init`,
          }
        },
      }),
      htlcInSet: builder.mutation<HtlcInSetResponse, HtlcInSetRequestTarget>({
        // invalidatesTags: ['Decks'],
        async onQueryStarted({ targetNetwork, ...args }, { dispatch, queryFulfilled }) {
          try {
            const { data: htlcInSet } = await queryFulfilled

            await queryFulfilled
            dispatch(htlcActions.setHtlcInSetRequest({ request: args }))
            dispatch(htlcActions.setHtlcInSetResponse({ response: htlcInSet }))
          } catch (e) {
            console.log(e)
          }
        },
        query: ({ targetNetwork, ...args }) => {
          return {
            body: args,
            method: 'POST',
            url: `/htlc/${targetNetwork}/in/set`,
          }
        },
      }),
      htlcOutInit: builder.mutation<HtlcOutInitResponse, HtlcOutInitRequestWithTarget>({
        // invalidatesTags: ['Decks'],
        async onQueryStarted({ targetNetwork, ...args }, { dispatch, queryFulfilled }) {
          try {
            const { data: htlcOutInit } = await queryFulfilled

            await queryFulfilled
            dispatch(htlcActions.setHtlcOutInitRequest({ request: args }))
            dispatch(htlcActions.setHtlcOutInitResponse({ response: htlcOutInit }))
          } catch (e) {
            console.log(e)
          }
        },

        query: ({ targetNetwork, ...args }) => {
          return {
            body: args,
            method: 'POST',
            url: `/htlc/${targetNetwork}/out/init`,
          }
        },
      }),
      htlcOutSet: builder.mutation<HtlcOutSetResponse, HtlcOutSetRequestTarget>({
        // invalidatesTags: ['Decks'],
        async onQueryStarted({ targetNetwork, ...args }, { dispatch, queryFulfilled }) {
          try {
            const { data: htlcOutSet } = await queryFulfilled

            await queryFulfilled
            dispatch(htlcActions.setHtlcOutSetRequest({ request: args }))
            dispatch(htlcActions.setHtlcOutSetResponse({ response: htlcOutSet }))
          } catch (e) {
            console.log(e)
          }
        },
        query: ({ targetNetwork, ...args }) => {
          return {
            body: args,
            method: 'POST',
            url: `/htlc/${targetNetwork}/out/set`,
          }
        },
      }),
    }
  },
})

export const {
  useHtlcInInitMutation,
  useHtlcInSetMutation,
  useHtlcOutInitMutation,
  useHtlcOutSetMutation,
} = HtlcService
