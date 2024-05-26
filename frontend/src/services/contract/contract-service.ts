import { BrowserProvider, Contract, InterfaceAbi, ethers } from 'ethers'

import { ERC20ABI } from './erc20-abi'
import { ELTToken} from './htlc-erc20-abi'

// const contractAddress = import.meta.env.VITE_HTLC_ADDRESS
// const tokenContract = import.meta.env.VITE_ERC20_ADDRESS
const timelock = parseInt(import.meta.env.VITE_TIMELOCK)

//ABI
const { abi: htlcContractABI } = ELTToken
const contractABI = ERC20ABI
let cachedContract: ethers.Contract | null

export const getContract = async (contractAddress: string) => {
  if (!cachedContract) {
    cachedContract = await getContractInstance(contractAddress, ELTToken.abi)
  }

  return cachedContract
}

export const subscribeToContractEvents = async (
  handler: (from: any) => void,
  contractAddress: string
) => {
  const contract = await getContract(contractAddress)

  await contract.on('*', handler)
}

export const unSubscribeToContractEvents = async (
  handler: (from: any) => void,
  contractAddress: string
) => {
  const contract = await getContract(contractAddress)

  await contract.removeListener('*', handler)
}
export const getContractInstance = async (
  contractAddress: string,
  contractABI: InterfaceAbi
): Promise<Contract> => {
  try {
    const provider = new BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    return new Contract(contractAddress, contractABI, signer)
  } catch (error) {
    console.error('Error creating contract:', error)
    throw error
  }
}

export const newContract = async (
  get: string,
  hashLock: any,
  amountWbtc: bigint,
  tokenContract: string,
  contractAddress: string
) => {
  const timeLockWithTimestamp = Math.floor(Date.now() / 1000) + timelock
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const tokenGetAddress = ethers.getAddress(get)
  const tokenContractAddress = ethers.getAddress(tokenContract)
  const contract = new ethers.Contract(contractAddress, htlcContractABI, signer)

  const res = await contract.newContract(
    tokenGetAddress,
    hashLock,
    timeLockWithTimestamp,
    tokenContractAddress,
    amountWbtc
  )

  await res.wait()

  return res.hash
}

export const refund = async (hash: string, contractAddress: string) => {
  const byteArrayHash = new Uint8Array(
    (hash.match(/.{1,2}/g) || []).map(byte => parseInt(byte, 16))
  )
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(contractAddress, htlcContractABI, signer)
  const tx = await contract.refund(byteArrayHash)

  await tx.wait()

  return tx
}

export const withdraw = async (hashlock: string, preimage: string, contractAddress: string) => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(contractAddress, htlcContractABI, signer)
  const tx = await contract.withdraw(hashlock, preimage)

  await tx.wait()

  return tx
}

export const mint = async (hashlock: string, preimage: string, contractAddress: string) => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(contractAddress, htlcContractABI, signer)
  const tx = await contract.withdraw(hashlock, preimage)

  await tx.wait()

  return tx
}
