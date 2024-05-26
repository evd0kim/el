export type HtlcInitRequest = {
  amount: number
  // protocol: string
  token: string
}

export type HtlcInInitRequest = HtlcInitRequest

export type HtlcInInitResponse = {
  fee_invoice: string
  fee_sat: number
  secret_hash: string
}

export type HtlcOutInitRequest = HtlcInitRequest

export type HtlcOutInitResponse = {
  address: string
  fee_sat: number
}

export type HtlcInSetRequest = {
  address: string
  payment_proof: string
  secret_hash: string
  token: string
}

export type HtlcInSetResponse = {
  incoming_invoice: string
  message: string
  status: string
  timelock: number
}

export type HtlcOutSetRequest = {
  bolt11: string
  tx: string
}

export type HtlcOutSetResponse = {
  payment_hash: string
}

export interface HtlcOutInitRequestWithTarget extends HtlcOutInitRequest {
  targetNetwork: string
}

export interface HtlcInInitRequestWithTarget extends HtlcInInitRequest {
  targetNetwork: string
}

export interface HtlcInSetRequestTarget extends HtlcInSetRequest {
  targetNetwork: string
}

export interface HtlcOutSetRequestTarget extends HtlcOutSetRequest {
  targetNetwork: string
}
