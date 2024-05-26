import React, { ComponentPropsWithoutRef, FC } from 'react'

import { clsx } from 'clsx'

import { ExchangeForm } from '~/pages/home-page/components/route_/exchange-form'
import { Button } from '~/shared/button'
import IconLinkBigArrow from '~/shared/icons/IconLinkBigArrow'
import Typography from '~/shared/typography/typography'
import { RouteData, linkCommon } from '~/shared/variables'

import s from './route_.module.scss'

type Props = ComponentPropsWithoutRef<'div'>
export const Route_: FC<Props> = ({ className, ...rest }) => {
  const { link, title } = RouteData
  const { href, linkText } = link
  const { rel, target } = linkCommon

  return (
    <div className={clsx(s.RouteRoot, className)} {...rest}>
      <div className={s.RouteWrapper}>
        <Typography.H2 className={s.RouteTitle}>{title}</Typography.H2>
        <Button
          as={'a'}
          className={s.InfoButton}
          href={href}
          rel={rel}
          target={target}
          variant={'default'}
        >
          <Typography.Body5 className={s.InfoButtonText}>{linkText}</Typography.Body5>
        </Button>
      </div>
      <ExchangeForm />
    </div>
  )
}
