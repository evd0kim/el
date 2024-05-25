import { ComponentPropsWithoutRef, FC } from 'react'

import { clsx } from 'clsx'

import IconLogo from '~/shared/icons/IconLogo'
import Typography from '~/shared/typography/typography'

import s from './logo.module.scss'

export type Props = ComponentPropsWithoutRef<'div'>

export const Logo: FC<Props> = ({ className }) => {
  return (
    <div className={clsx(s.LogoRoot, className)}>
      <IconLogo className={s.LogoIcon} />
    </div>
  )
}
