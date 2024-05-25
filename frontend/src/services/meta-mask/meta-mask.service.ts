import { ethers } from 'ethers'

import { ERC20ABI } from '~/services/contract/erc20-abi'
import { formatBalance, substrBalance } from '~/shared/functions/functions'
import { networks, unit } from '~/shared/variables'

// const contractAddresses = {
//   eth: import.meta.env.VITE_HTLC_ADDRESS_SEPOLIA,
//   linea: import.meta.env.VITE_HTLC_LINEA_MAINNET,
// }
//
// const erc20AddressWbtc = {
//   eth: import.meta.env.VITE_ERC20_ADDRESS_SEPOLIA,
//   linea: import.meta.env.VITE_ERC20_LINEA_MAINNET,
// }

// ABI
const contractABI = ERC20ABI

export const subscribeToMetaMaskEvents = (handler: () => void) => {
  window?.ethereum?.on('accountsChanged', handler)
  window?.ethereum?.on('chainChanged', handler)
}

export const unSubscribeFromMetaMaskEvents = (handler: () => void) => {
  window?.ethereum?.removeListener('accountsChanged', handler)
  window?.ethereum?.removeListener('chainChanged', () => {})
}

export const getChainId = async () => {
  if (window.ethereum.isMetaMask) {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })

      return chainId
    } catch (error) {
      console.error('Failed to get chain ID:', error)

      return null
    }
  } else {
    console.log('MetaMask is not available')

    return null
  }
}

export const getAddressMetaMask = async (signer: ethers.Signer): Promise<string> => {
  return await signer.getAddress()
}

export const makeContractMetaMask = async (
  network: string
): Promise<{
  contract: ethers.Contract
  signer: ethers.Signer
}> => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(networks[network].tokenContract, contractABI, signer)

  return { contract, signer }
}

export const getBalanceMetaMask = async ({
  address,
  contract,
}: {
  address: string
  contract: ethers.Contract
}) => {
  return await contract.balanceOf(address)
}

export const approveFundsMetaMask = async (
  contract: ethers.Contract,
  amountWbtc: ethers.BigNumberish,
  network: string
) => {
  const tx = await contract.approve(networks[network].contractAddress, amountWbtc)

  await tx.wait()

  return tx
}

export const getAccountsMetaMask = async () => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

  return accounts[0]
}

export const getBalanceEthMetaMask = async (account: ethers.Signer) => {
  const res = formatBalance(
    await window.ethereum.request({
      method: 'eth_getBalance',
      params: [account, 'latest'],
    }),
    6
  )

  return formatBalance(
    await window.ethereum.request({
      method: 'eth_getBalance',
      params: [account, 'latest'],
    }),
    6
  )
}

export const getBalanceWbtcMetaMask = async (contract: ethers.Contract, account: ethers.Signer) => {
  try {
    const userTokenBalance = await contract.balanceOf(account)

    return substrBalance(ethers.formatUnits(userTokenBalance, unit.wbtc))
  } catch (error) {
    console.error('Error:', error)

    return '0'
  }
}
