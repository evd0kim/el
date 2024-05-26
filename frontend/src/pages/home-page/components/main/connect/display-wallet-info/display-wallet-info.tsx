import { useState } from 'react'

import { clsx } from 'clsx'

import { useAppSelector } from '~/services/store'
import { Button } from '~/shared/button'
import IconConnectNetwork from '~/shared/icons/IconConnectNetwork'
import { IconDownloadAnimated } from '~/shared/icons/IconDownloadAnimated'
import IconMetaMask from '~/shared/icons/IconMetamask'
import Typography from '~/shared/typography/typography'
import { connectData, statusData } from '~/shared/variables'

import s from './daisplay-wallet-info.module.scss'

type ExcludeConnect<T> = T extends 'Connect' ? never : T

type Variant = ExcludeConnect<(typeof connectData.info)[keyof typeof connectData.info]>

type Props = {
  onClick: () => void
  variant: Variant
}

export const DisplayWalletInfo = ({ onClick, variant }: Props) => {
  const metaMaskWallet = useAppSelector(state => state.metaMask)
  const { connect, nameMetaMask } = connectData.info
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false)

  const renderWallet = (variant: Variant) => {
    switch (variant) {
      case nameMetaMask:
        return metaMaskWallet
      default:
        return metaMaskWallet
    }
  }

  const renderWalletName = (variant: Variant) => {
    switch (variant) {
      case nameMetaMask:
        return nameMetaMask
      default:
        return ''
    }
  }

  const renderWalletIcon = (variant: Variant) => {
    switch (variant) {
      case nameMetaMask:
        return <IconMetaMask className={s.DisplayWalletInfoSucceededIcon} />
      default:
        return null
    }
  }

  const { balance, status } = renderWallet(variant)

  const handleButtonClick = async () => {
    setIsButtonDisabled(true)
    try {
      await onClick()
    } catch (error) {
      console.error('An error occurred:', error)
    } finally {
      setIsButtonDisabled(false)
    }
  }

  if (status === statusData.idle || status === statusData.failed) {
    return (
      <Button
        className={s.DisplayWalletInfoRoot}
        disabled={isButtonDisabled}
        onClick={handleButtonClick}
        variant={'default'}
      >
        <IconConnectNetwork className={s.DisplayWalletInfoIcon} />
        <Typography.Body2 className={s.DisplayWalletInfoText}>
          {renderWalletName(variant)}
        </Typography.Body2>
      </Button>
    )
  }

  if (status === statusData.loading) {
    return (
      <div className={s.DisplayWalletInfoRoot}>
        <IconDownloadAnimated className={s.DisplayWalletInfoIcon} />
        <Typography.Body2 className={clsx(s.DisplayWalletInfoText, s.DisplayWalletInfoTextConnect)}>
          {connect}
        </Typography.Body2>
      </div>
    )
  }

  return (
    <>
      {balance.map((item, index) => (
        <div className={s.DisplayWalletInfoRoot} key={index}>
          {renderWalletIcon(variant)}
          <Typography.Body2 className={s.DisplayWalletInfoText}>
            {item.value} {item.currency}
          </Typography.Body2>
        </div>
      ))}
    </>
  )
}
