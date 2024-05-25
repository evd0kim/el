export type AssetData = {
  PriceUSD: number
  SplyAct1yr: number
  SplyAct7d: number
  TxCnt: number
  asset: 'btc' | 'hbtc' | 'renbtc' | 'wbtc'
  time: string
}

export type RatesResponse = {
  data: AssetData[]
}
