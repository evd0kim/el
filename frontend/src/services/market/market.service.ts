import { baseApi } from '~/services/base-api'
import { RatesResponse } from '~/services/market'

export const MarketService = baseApi.injectEndpoints({
  endpoints: builder => {
    return {
      getRates: builder.query<RatesResponse, void>({
        query: () => `/market/tokens`,
      }),
    }
  },
})
export const { useGetRatesQuery } = MarketService
