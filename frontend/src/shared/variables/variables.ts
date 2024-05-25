import IconGitHub from '~/shared/icons/IconGitHub'
import IconMedium from '~/shared/icons/IconMedium'
import IconTwitter from '~/shared/icons/IconTwitter'
import blockchainFoundersGroup from '~/shared/icons/blockchainFoundersGroup.svg'
import consensys from '~/shared/icons/consensys.svg'
import mendiFinance from '~/shared/icons/mendiFinance.svg'

interface Networks {
  [key: string]: {
    chainId: string
    contractAddress: string
    currency: string
    decimals: number
    name: string
    partUrl: string
    targetNetwork: string
    tokenContract: string
  }
}

export const linkCommon = {
  rel: 'noopener noreferrer',
  target: '_blank',
}

export const headerData = {
  links: [
    {
      href: 'https://blog.satsbridge.com/',
      icon: IconMedium,
      id: '0',
      title: 'Medium',
    },
    {
      href: 'https://twitter.com/satsbridge',
      icon: IconTwitter,
      id: '1',
      title: 'X',
    },
    {
      href: 'https://github.com/SatsBridge',
      icon: IconGitHub,
      id: '2',
      title: 'GitHub',
    },
  ],
  text: 'Bridge between Lightning\u00A0Network and\u00A0Ethereum\u00A0Layer\u00A02',
}

export const mainData = {
  infoTextEnd: ' between Lightning&nbsp;Network and&nbsp;Ethereum&nbsp;Layer&nbsp;2',
  /*' that instantly exchanges data between the&nbsp;Lightning&nbsp;Network and&nbsp;Ethereum&nbsp;Layer&nbsp;2',*/
  infoTextMiddle: 'bridge',
  infoTextStart: 'To ',
}
export const infoData = {
  info: {
    price: 'Price',
    sats: 'Sats per Dollar',
  },
  link: {
    href: 'https://bitcoin.clarkmoody.com/dashboard/',
    linkText: 'See all',
  },
  skeleton: {
    countGroup: 5,
    countSingle: 1,
  },
  title: 'BTC info',
}

export const statusData = {
  failed: 'FAILED',
  idle: 'IDLE',
  loading: 'LOADING',
  succeeded: 'SUCCEEDED',
} as const

export type Status = (typeof statusData)[keyof typeof statusData]

export const currencyData = {
  btc: 'BTC',
  eth: 'ETH',
  sats: 'sats',
  usd: '$',
  wbtc: 'wBTC',
} as const

export const lnBtc = 'LN-BTC'

export const RouteData = {
  exchangeForm: {
    selectValues: [
      { description: 'Wrapped Bitcoin', disabled: false, id: '1', title: 'wBTC' },
      { description: 'Lightning Bitcoin', disabled: false, id: '2', title: 'LN-BTC' },
    ] as const,
  },
  link: {
    href: 'https://satsbridge.com/dashboard/d/bridge/satsbridge-node?orgId=1',
    linkText: 'Bridge stats',
  },
  // },
  title: 'Route',
}

export const connectData = {
  button: 'Have no alby?',
  info: {
    connect: 'Connect...',
    nameAlby: 'Alby',
    nameMetaMask: 'MetaMask',
  },
  title: 'Connect',
} as const

export const partnersData = {
  links: [
    {
      alt: 'Consensys',
      href: 'https://consensys.io/',
      icon: consensys,
      id: '1',
    },
    {
      alt: 'Mendi Finance',
      href: 'https://mendi.finance/',
      icon: mendiFinance,
      id: '2',
    },
    {
      alt: 'Blockchain Founders Group',
      href: 'https://blockchain-founders.io/',
      icon: blockchainFoundersGroup,
      id: '3',
    },
  ],
  title: 'Our Partners:',
}

export const footerData = {
  copyrightNotice: 'SatsBridge GmbH. All rights reserved',
  links: [
    {
      href: 'mailto:satsbridge@pm.me',
      id: '1',
      title: 'satsbridge@pm.me',
    },
    {
      href: '#',
      id: '2',
      title: 'Our Privacy Policy',
    },
  ],
}
export const networks: Networks = {
  '0xaa36a7': {
    chainId: '0xaa36a7',
    contractAddress: import.meta.env.VITE_HTLC_ADDRESS_SEPOLIA,
    currency: 'SepoliaETH',
    decimals: 8,
    name: 'Sepolia',
    partUrl: '',
    targetNetwork: import.meta.env.VITE_TARGET_NETWORK_SEPOLIA,
    tokenContract: import.meta.env.VITE_ERC20_ADDRESS_SEPOLIA,
  },
  '0xe708': {
    chainId: '0xe708',
    contractAddress: import.meta.env.VITE_HTLC_ADDRESS_LINEA_MAINNET,
    currency: 'ETH',
    decimals: 8,
    name: 'Linea Mainnet',
    partUrl: 'linea.',
    targetNetwork: import.meta.env.VITE_TARGET_NETWORK_LINEA_MAINNET,
    tokenContract: import.meta.env.VITE_ERC20_ADDRESS_LINEA_MAINNET,
  },
}

export const unit = {
  btc: 8,
  eth: 8,
  tbtc: 18,
  wbtc: 8,
}
