import { useEffect, useState } from 'react'

import { Html5Qrcode } from 'html5-qrcode'
// import { decodePaymentRequest } from 'ln-service'
// import { setupNetworkIdTimer } from 'venom-connect/dist/types/providers/connectors/networkIdTimerUtil'

import Typography from '~/shared/typography/typography'

import './test.scss'

import s from './test.module.scss'

export const Test = () => {
  const [isEnabled, setEnabled] = useState<boolean>(true)
  const [qrMessage, setQrMessage] = useState('')
  const [isQRScanned, setQRScanned] = useState<boolean>(false)

  useEffect(() => {
    const config = { fps: 10, qrbox: { height: 200, width: 200 } }
    const html5QrCode = new Html5Qrcode('qrCodeContainer')

    const qrScannerStop = () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode
          .stop()
          .then(() => console.log('Scanner stop'))
          .catch(() => console.log('Scanner error'))
      }
    }

    const qrCodeSuccess = (decodedText: any) => {
      setQrMessage(decodedText)
      setEnabled(false)
      setQRScanned(true)
    }

    if (isEnabled) {
      html5QrCode.start({ facingMode: 'environment' }, config, qrCodeSuccess, () => {})
    }
  }, [isEnabled])

  return (
    // <div className={s.Scanner}>
    <>
      <div id={'qrCodeContainer'}></div>
      {isQRScanned && (
        <img
          alt={'QR Code'}
          src={`https://api.qrserver.com/v1/create-qr-code/?data=${qrMessage}&size=200x200`}
        />
      )}
      {qrMessage && <Typography.H1 className={s.Text}>{qrMessage}</Typography.H1>}
      {/*<button className={s.Button} onClick={() => setEnabled(!isEnabled)}>*/}
      {/*  22*/}
      {/*</button>*/}
    </>
    // </div>
  )
}
//
// function LightningInvoiceDecoder() {
//   const [invoice, setInvoice] = useState('')
//   const [decodedInvoice, setDecodedInvoice] = useState(null)
//   const [isPaid, setIsPaid] = useState(false)
//   const [error, setError] = useState(null)
//
//   const decodeInvoice = async () => {
//     try {
//       const decoded = await decodePaymentRequest({ request: invoice })
//
//       setDecodedInvoice(decoded)
//       setIsPaid(decoded.is_paid)
//       setError(null)
//     } catch (err) {
//       console.error('Ошибка расшифровки счета:', err)
//       setError('Ошибка расшифровки счета')
//       setDecodedInvoice(null)
//     }
//   }
//
//   return (
//     <div>
//       <input
//         onChange={e => setInvoice(e.target.value)}
//         placeholder={'Введите счет Lightning Network'}
//         type={'text'}
//         value={invoice}
//       />
//       <button onClick={decodeInvoice}>Расшифровать счет</button>
//       {decodedInvoice && (
//         <div>
//           <p>Сумма: {decodedInvoice.tokens} сатоши</p>
//           {isPaid ? <p>Счет оплачен</p> : <p>Счет не оплачен</p>}
//           {/* Другие свойства расшифрованного счета можно использовать здесь */}
//         </div>
//       )}
//       {error && <p>{error}</p>}
//     </div>
//   )
// }
