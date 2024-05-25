import React, { ComponentPropsWithoutRef, FC, useEffect, useState } from 'react'

import { clsx } from 'clsx'

import { Button } from '~/shared/button'
import IconCollapsedArrow from '~/shared/icons/IconCollapsedArrow'
import Typography from '~/shared/typography/typography'

import s from './new-select.module.scss'

type Props = {
  onChange: (selectedValue: string) => void
  options: any
  value: string
} & ComponentPropsWithoutRef<'div'>

export const NewSelect: FC<Props> = ({ className, onChange, options, value, ...rest }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const selectHeader = document.querySelector('.select-header')
      const optionsContainer = document.querySelector('.options')

      if (
        selectHeader &&
        optionsContainer &&
        !selectHeader.contains(event.target as Node) &&
        !optionsContainer.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setIsOpen(false)
  }

  const rootClassName = clsx(s.CustomSelectRoot, { [s.isOpen]: isOpen }, className)
  const selectTriggerText = clsx(s.SelectTriggerText, { [s.isOpen]: isOpen }, className)

  return (
    <div className={rootClassName}>
      <Button
        className={s.SelectTrigger}
        onClick={toggleDropdown}
        type={'button'}
        variant={'default'}
      >
        <Typography.Body2 className={selectTriggerText}>{value}</Typography.Body2>
        <IconCollapsedArrow
          className={`${s.SelectTriggerIcon} ${isOpen && s.SelectTriggerIconOpen}`}
          color={`${isOpen ? 'var(--color-accent-lime)' : 'var(--color-dark-gray)'}`}
        />
      </Button>
      {isOpen && (
        <div className={s.CustomSelectOptions}>
          {options.map((option, index) => (
            <Typography.Body2
              className={s.CustomSelectOption}
              key={index}
              onClick={() => handleSelect(Object.keys(option)[0])}
            >
              {Object.values(option)[0]}
            </Typography.Body2>
          ))}
        </div>
      )}
    </div>
  )
}
