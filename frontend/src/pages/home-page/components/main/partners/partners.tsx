import React, { ComponentPropsWithoutRef, FC } from 'react'

import { clsx } from 'clsx'

import { Button } from '~/shared/button'
import Typography from '~/shared/typography/typography'
import { linkCommon, partnersData } from '~/shared/variables'

import s from './partners.module.scss'

type Props = ComponentPropsWithoutRef<'div'>
export const Partners: FC<Props> = ({ className, ...rest }) => {
  const { links, title } = partnersData
  const { rel, target } = linkCommon

  return (
    <div className={clsx(s.PartnersRoot, className)} {...rest}>
      <Typography.Body2 className={s.PartnersTitle}>{title}</Typography.Body2>
      {links.map(l => (
        <Button
          as={'a'}
          className={s.PartnersLink}
          href={l.href}
          key={l.id}
          rel={rel}
          target={target}
          variant={'default'}
        >
          <img alt={l.alt} src={l.icon} />
        </Button>
      ))}
    </div>
  )
}
