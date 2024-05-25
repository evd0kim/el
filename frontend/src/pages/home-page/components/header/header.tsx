import { ComponentPropsWithoutRef, FC } from 'react'

import { clsx } from 'clsx'

import { Button } from '~/shared/button'
import { Logo } from '~/shared/logo/logo'
import Typography from '~/shared/typography/typography'
import { headerData, linkCommon } from '~/shared/variables'

import s from './header.module.scss'

type Props = ComponentPropsWithoutRef<'header'>

export const Header: FC<Props> = ({ className, ...rest }) => {
  const { links, text } = headerData
  const { rel, target } = linkCommon

  const classNames = clsx(s.HeaderRoot, className)

  return (
    <header className={classNames} {...rest}>
      <div className={s.HeaderContainer}>
        <Logo className={s.HeaderLogo} />
        <Typography.Body2 className={s.HeaderText}>{text}</Typography.Body2>
      </div>
      <div className={s.HeaderContainer}>
        {links.map(l => (
          <Button
            as={'a'}
            className={s.HeaderLink}
            href={l.href}
            key={l.id}
            rel={rel}
            target={target}
            title={l.title}
            variant={'default'}
          >
            <l.icon className={s.HeaderLinkLogo} />
            <Typography.Body1 className={s.HeaderLinkInfo}>{l.title}</Typography.Body1>
          </Button>
        ))}
      </div>
    </header>
  )
}
