import { ComponentPropsWithoutRef, FC, useEffect, useState } from 'react'

import { clsx } from 'clsx'

import { Button } from '~/shared/button'
import Typography from '~/shared/typography/typography'
import { footerData, linkCommon } from '~/shared/variables'

import s from './footer.module.scss'

import packageJson from '../../../../../package.json'

const version = packageJson.version

type Props = ComponentPropsWithoutRef<'footer'>

export const Footer: FC<Props> = ({ className, ...rest }) => {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  const classNames = clsx(s.FooterRoot, className)

  return (
    <footer className={s.FooterRoot} {...rest}>
      <Typography.Body1 className={s.FooterCopyrightNotice}>
        {`© ${currentYear} ${footerData.copyrightNotice}`}
      </Typography.Body1>
      <div className={s.FooterWrapper}>
        <Typography.Body1 className={s.FooterAppVersion}>v {version}</Typography.Body1>
        {footerData.links.map(l => (
          <Button
            as={'a'}
            className={s.FooterLink}
            href={l.href}
            key={l.id}
            rel={linkCommon.rel}
            target={linkCommon.target}
            title={l.title}
            variant={'default'}
          >
            <Typography.Body1 className={s.FooterLinkText}>{l.title}</Typography.Body1>
          </Button>
        ))}
      </div>
    </footer>
  )
}
