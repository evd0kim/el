// import { useEffect, useState } from 'react'
//
// import { BrowserProvider, ethers } from 'ethers'
//
// import { HTLCERC20ABI } from '~/services/contract'
// import { htlcActions } from '~/services/htlc/htlc.slice'
// import { useAppDispatch } from '~/services/store'
//
// const contractAddress = import.meta.env.VITE_HTLC_ADDRESS
//
// //ABI
// const { abi: htlcContractABI } = HTLCERC20ABI // ABI вашего смарт-контракта
//
// export const Test1 = () => {
//   const dispatch = useAppDispatch()
//   const [events, setEvents] = useState<{ data: string; topics: string[] }[]>([])
//
//   useEffect(() => {
//     async function fetchEvents() {
//       try {
//         const provider = new ethers.JsonRpcProvider(
//           'https://goerli.infura.io/v3/cca65a0323e949a49a91e1a5710c25bd'
//         )
//
//         console.log(provider)
//         //Создаем экземпляр контракта
//         const contract = new ethers.Contract(contractAddress, htlcContractABI, provider)
//
//         // Получаем номер последнего блока
//         const lastBlockNumber = await provider.getBlockNumber()
//         // const block = await provider.getBlock(blockNumber)
//
//         console.log(lastBlockNumber)
//         // Начинаем подписку на новые блоки
//         provider.on('block', async blockNumber => {
//           //   // Проверяем, если блок новый
//           // if (blockNumber > lastBlockNumber) {
//           if (blockNumber > lastBlockNumber) {
//             // Получаем информацию о новом блоке
//             const block = await provider.getBlock(blockNumber)
//
//             // console.log(block)
//             // Проверяем, что блок не равен null
//             if (block !== null) {
//               // Получаем транзакции в новом блоке
//               for (const transactionHash of block.transactions) {
//                 const tx = await provider.getTransaction(transactionHash)
//
//                 //Проверяем, если транзакция отправлена на ваш контракт
//                 if (tx !== null && tx.to === contractAddress) {
//                   // Получаем транзакцию
//                   const fullTx = await tx.wait()
//
//                   console.log('fullTx', fullTx)
//                   if (
//                     fullTx?.to === '0xB62fC95c5E225D8Ae0586c0D3DabACe802D53534' &&
//                     fullTx?.from === '0x790D73BF4C561d1a01A211977733F7539A540ee9'
//                   ) {
//                     dispatch(htlcActions.setEventName({ eventName: 'HTLCERC20New' }))
//                   }
//                   //       //
//                   //       //           // Анализируем события в транзакции
//                   //       //           const parsedLogs = fullTx?.logs.map(log => ({
//                   //       //             data: log.data,
//                   //       //             topics: [...log.topics], // Копируем массив topics
//                   //       //           }))
//                   //       //
//                   //       //           parsedLogs?.forEach(log => {
//                   //       //             console.log('Новое событие:', log)
//                   //       //             setEvents(prevEvents => [...prevEvents, log])
//                   //       //           })
//                 }
//               }
//             }
//           }
//         })
//
//         // Отменяем подписку при размонтировании компонента
//         return () => {
//           provider.removeAllListeners('block')
//         }
//       } catch (error) {
//         console.error('Ошибка при отслеживании событий:', error)
//       }
//     }
//
//     fetchEvents()
//   }, [])
//
//   return <div></div>
// }
