import { PayloadAction, createSlice } from '@reduxjs/toolkit/react'

import {
  HtlcInInitRequest,
  HtlcInInitResponse,
  HtlcInSetRequest,
  HtlcInSetResponse,
  HtlcOutInitRequest,
  HtlcOutInitResponse,
  HtlcOutSetRequest,
  HtlcOutSetResponse,
} from '~/services/htlc/htlc.types'
import { statusData } from '~/shared/variables/variables'

type Balance = {
  currency: 'sats'
  value: string
}

type Status = (typeof statusData)[keyof typeof statusData]

type Invoice = {
  bolt11: null | string
  hash: null | string
}

type InitialState = {
  eventName: null | string
  htlcInInit: {
    request: HtlcInInitRequest
    response: HtlcInInitResponse
  }
  htlcInSet: {
    request: HtlcInSetRequest
    response: HtlcInSetResponse
  }
  htlcOutInit: {
    request: HtlcOutInitRequest
    response: HtlcOutInitResponse
  }
  htlcOutSet: {
    request: HtlcOutSetRequest
    response: HtlcOutSetResponse
  }
  invoiceOutLn: Invoice
  payFeeIn: {
    paymentProof: null | string
  }
  payInvoiceIn: {
    preimage: null | string
  }
  txOut: null | string
}

const initialState: InitialState = {
  eventName: null,
  htlcInInit: {
    request: {} as HtlcInInitRequest,
    response: {} as HtlcInInitResponse,
  },
  htlcInSet: {
    request: {} as HtlcInSetRequest,
    response: {} as HtlcInSetResponse,
  },
  htlcOutInit: {
    request: {} as HtlcOutInitRequest,
    response: {} as HtlcOutInitResponse,
  },
  htlcOutSet: {
    request: {} as HtlcOutSetRequest,
    response: {} as HtlcOutSetResponse,
  },
  invoiceOutLn: {
    bolt11: null,
    hash: null,
  },
  payFeeIn: {
    paymentProof: null,
  },
  payInvoiceIn: {
    preimage: null,
  },
  txOut: null,
}

const slice = createSlice({
  initialState,
  name: 'htlc',
  reducers: {
    resetState: () => initialState,
    setEventName: (state, action: PayloadAction<{ eventName: string }>) => {
      state.eventName = action.payload.eventName
    },
    setHtlcInInitRequest: (state, action: PayloadAction<{ request: HtlcInInitRequest }>) => {
      state.htlcInInit.request = action.payload.request
    },
    setHtlcInInitResponse: (state, action: PayloadAction<{ response: HtlcInInitResponse }>) => {
      state.htlcInInit.response = action.payload.response
    },
    setHtlcInSetRequest: (state, action: PayloadAction<{ request: HtlcInSetRequest }>) => {
      state.htlcInSet.request = action.payload.request
    },
    setHtlcInSetResponse: (state, action: PayloadAction<{ response: HtlcInSetResponse }>) => {
      state.htlcInSet.response = action.payload.response
    },
    setHtlcOutInitRequest: (state, action: PayloadAction<{ request: HtlcOutInitRequest }>) => {
      state.htlcOutInit.request = action.payload.request
    },
    setHtlcOutInitResponse: (state, action: PayloadAction<{ response: HtlcOutInitResponse }>) => {
      state.htlcOutInit.response = action.payload.response
    },
    setHtlcOutSetRequest: (state, action: PayloadAction<{ request: HtlcOutSetRequest }>) => {
      state.htlcOutSet.request = action.payload.request
    },
    setHtlcOutSetResponse: (state, action: PayloadAction<{ response: HtlcOutSetResponse }>) => {
      state.htlcOutSet.response = action.payload.response
    },
    setInvoiceOutLn: (state, action: PayloadAction<{ bolt11: string; hash: string }>) => {
      state.invoiceOutLn.bolt11 = action.payload.bolt11
      state.invoiceOutLn.hash = action.payload.hash
    },
    setPaymentProofIn: (state, action: PayloadAction<{ paymentProof: string }>) => {
      state.payFeeIn.paymentProof = action.payload.paymentProof
    },
    setPreimageIn: (state, action: PayloadAction<{ preimage: string }>) => {
      state.payInvoiceIn.preimage = action.payload.preimage
    },
    setTxOut: (state, action: PayloadAction<{ tx: string }>) => {
      state.txOut = action.payload.tx
    },
  },
})

export const htlcReducer = slice.reducer
export const htlcActions = slice.actions
