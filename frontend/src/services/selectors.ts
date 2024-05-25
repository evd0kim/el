import { RootState } from './store'

export const selectNetwork = (state: RootState) => state.app.exchange.network
