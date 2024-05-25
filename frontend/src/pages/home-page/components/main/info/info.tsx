import React, { ComponentPropsWithoutRef, FC } from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

import { clsx } from 'clsx'

import { RatesResponse, useGetRatesQuery } from '~/services/market'
import { Button } from '~/shared/button'
import IconLinkSmallArrow from '~/shared/icons/IconLinkSmallArrow'
import Typography from '~/shared/typography/typography'
import { currencyData, infoData, linkCommon } from '~/shared/variables'

import s from './info.module.scss'

type Props = ComponentPropsWithoutRef<'div'>

export const Info: FC<Props> = ({ className, ...rest }) => {
  const { data, isLoading } = useGetRatesQuery()
  const { rel, target } = linkCommon
  const { info, link, skeleton, title } = infoData
  const { href, linkText } = link
  const { price, sats } = info
  const { usd } = currencyData
  const { countGroup, countSingle } = skeleton

  //TODO убрать формулы в отдельный файл

  const roundNumber = (value: number) => Math.round(value)
  const formatNumberWithSpaces = (value: null | number | string) =>
    value && value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

  const getBtcInfo = (data: RatesResponse) => {
    return data.data.filter(d => d.asset === 'btc')[0]
  }

  const getArrayForTransaction = (data: RatesResponse) => {
    return data.data.filter(d => d.asset !== 'btc')
  }

  const getBtcPrice = (data: RatesResponse) => {
    const infoBtc = getBtcInfo(data)

    if (infoBtc) {
      return formatNumberWithSpaces(roundNumber(infoBtc.PriceUSD))
    } else {
      return null
    }
  }

  const bitcoinConverter = (data: RatesResponse) => {
    const infoBtc = getBtcInfo(data)

    if (infoBtc) {
      const priceBtc = infoBtc.PriceUSD

      return Math.round((1 / priceBtc) * 100000000)
    } else {
      return null
    }
  }

  const bitcoinPrice = data && `${usd} ${getBtcPrice(data)}`
  const satsPerDollar =
    data && bitcoinConverter(data) && formatNumberWithSpaces(bitcoinConverter(data))
  const transactions = data && getArrayForTransaction(data)

  return (
    <div className={clsx(s.InfoRoot, className)} {...rest}>
      <Typography.H2 className={s.InfoTitle}>{title}</Typography.H2>
      {data ? (
        <>
          <div className={s.InfoItem}>
            <Typography.Body3>{price}</Typography.Body3>
            <Typography.Body4>{bitcoinPrice}</Typography.Body4>
          </div>
          <div className={s.InfoItem}>
            <Typography.Body3>{sats}</Typography.Body3>
            <Typography.Body4>{satsPerDollar}</Typography.Body4>
          </div>
          {transactions?.map((item, index) => (
            <div className={s.InfoItem} key={index}>
              <Typography.Body3>
                {item.asset.slice(0, -3)}
                {item.asset.slice(-3).toUpperCase()} transactions
              </Typography.Body3>
              <Typography.Body4>{item.TxCnt}</Typography.Body4>
            </div>
          ))}
        </>
      ) : (
        <SkeletonTheme baseColor={'#202020'} highlightColor={'#444'}>
          {[...Array(countGroup)].map((_, index) => (
            <div className={s.InfoItem} key={index}>
              <Typography.Body3 className={s.InfoSkeleton}>
                <Skeleton count={countSingle} />
              </Typography.Body3>
            </div>
          ))}
        </SkeletonTheme>
      )}
      <Button
        as={'a'}
        className={s.InfoButton}
        href={href}
        rel={rel}
        target={target}
        variant={'default'}
      >
        <Typography.Body4>{linkText}</Typography.Body4>
        <IconLinkSmallArrow className={s.InfoButtonIcon} />
      </Button>
    </div>
  )
}
