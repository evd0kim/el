import { CSSProperties, FC, ReactNode } from 'react'

import { clsx } from 'clsx'
import { JSX } from 'react/jsx-runtime'

import s from './typography.module.scss'

export type Tag = keyof JSX.IntrinsicElements

export type TypographyProps<T extends Tag> = {
  children: ReactNode
  className?: string
  color?: CSSProperties['color']
}

const createTypographyComponent = <T extends Tag>(component: Component): FC<TypographyProps<T>> => {
  return ({ children, className, color, ...rest }) => {
    const ReactComponent = COMPONENTS[component]

    const classNames = clsx(`${s[component]}`, className)

    return (
      <ReactComponent className={classNames} style={{ color }} {...rest}>
        {children}
      </ReactComponent>
    )
  }
}

const Typography = {
  Body1: createTypographyComponent('body1'),
  Body2: createTypographyComponent('body2'),
  Body3: createTypographyComponent('body3'),
  Body4: createTypographyComponent('body4'),
  Body5: createTypographyComponent('body5'),
  Body6: createTypographyComponent('body6'),
  Error: createTypographyComponent('error'),
  H1: createTypographyComponent('h1'),
  H2: createTypographyComponent('h2'),
  H3: createTypographyComponent('h3'),
  Label: createTypographyComponent('label'),
}

const COMPONENTS = {
  body1: 'p',
  body2: 'span',
  body3: 'span',
  body4: 'span',
  body5: 'span',
  body6: 'span',
  error: 'span',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  label: 'label',
} as const

type Component = keyof typeof COMPONENTS

export default Typography
