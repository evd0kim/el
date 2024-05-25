import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import {
  Content,
  Item,
  Portal,
  Root,
  ScrollDownButton,
  Trigger,
  Value,
  Viewport,
} from '@radix-ui/react-select'

import { BTCPriceStream } from '~/pages/home-page/components/main/info/BTCPriceSteam/BTCPriceSteam'
import { appActions } from '~/services/app'
import { Button } from '~/shared/button'
import IconCollapsedArrow from '~/shared/icons/IconCollapsedArrow'
import Typography from '~/shared/typography/typography'
import { RouteData } from '~/shared/variables/variables'

import s from './select.module.scss'

type Props = {
  children: ReactNode
  className: string
  handleFocus: any
  inputValue: string
  isFocused: boolean
  isSelectBlocked: boolean
  name: string
  value: string
}

export const Select = ({
  children,
  className,
  handleFocus,
  inputValue,
  isFocused,
  isSelectBlocked,
  name,
  value,
}: Props) => {
  const dispatch = useDispatch()
  const { selectValues } = RouteData.exchangeForm
  const [maxContentHeight, setMaxContentHeight] = useState<any>(null)
  const [contentWidth, setContentWidth] = useState<any>(null)
  const triggerRef = useRef<any>(null)
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false)

  const handleSelectOpen = () => {
    !isSelectBlocked && setIsSelectOpen(!isSelectOpen)
  }

  useEffect(() => {
    const updateContentWidth = () => {
      if (triggerRef.current) {
        const triggerWidth = triggerRef.current.offsetWidth

        setContentWidth(triggerWidth)
        const triggerRect = triggerRef.current.getBoundingClientRect()
        const screenHeight = window.innerHeight
        const distanceToBottom = screenHeight - triggerRect.bottom
        const maxPortalHeight = Math.min(distanceToBottom, screenHeight)

        setMaxContentHeight(`${maxPortalHeight + 1}px`)
      }
    }

    updateContentWidth()
    window.addEventListener('resize', updateContentWidth)
    window.addEventListener('scroll', updateContentWidth)

    return () => {
      window.removeEventListener('resize', updateContentWidth)
      window.removeEventListener('scroll', updateContentWidth)
    }
  }, [])

  const handleValueChange = (newValue: string) => {
    if (newValue) {
      name === 'give'
        ? dispatch(appActions.setExchangeFrom({ give: newValue }))
        : dispatch(appActions.setExchangeTo({ get: newValue }))
    }
  }

  // TODO что-то с фокусом не то
  const handleOnCloseAutoFocus = (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    handleFocus()
  }

  return (
    <Root
      onOpenChange={handleSelectOpen}
      onValueChange={handleValueChange}
      open={isSelectOpen}
      value={value}
    >
      <div
        className={`${s.SelectWrapper} ${
          isSelectOpen ? s.SelectWrapperTriggerOpen : s.SelectWrapperTriggerClose
        } ${isFocused && s.SelectWrapperInputFocused} ${
          !isFocused && inputValue === '' && s.SelectWrapperInputEmpty
        } ${className}`}
        ref={triggerRef}
        // style={{ width: `${contentWidth}px` }}
      >
        {/*{!isSelectOpen && <BTCPriceStream inputValue={inputValue} />}*/}
        {children}
        <Button
          as={Trigger}
          className={s.SelectTrigger}
          disabled={isSelectBlocked}
          variant={'default'}
        >
          <Value>
            <Typography.Body6
              className={`${s.SelectTriggerText} ${isSelectOpen && s.SelectTriggerTextOpen}`}
            >
              {value}
            </Typography.Body6>
          </Value>
          <IconCollapsedArrow
            className={`${s.SelectTriggerIcon} ${isSelectOpen && s.SelectTriggerIconOpen}`}
            color={'var(--color-accent-lime)'}
          />
        </Button>
      </div>
      <Portal>
        <Content
          align={'end'}
          alignOffset={-1}
          avoidCollisions={false}
          className={s.SelectContent}
          onCloseAutoFocus={handleOnCloseAutoFocus}
          position={'popper'}
          ref={ref => ref?.addEventListener('touchend', e => handleOnCloseAutoFocus(e))}
          side={'bottom'}
          style={{ maxHeight: maxContentHeight, width: `${contentWidth}px` }}
        >
          <Viewport className={s.SelectViewport}>
            {selectValues.map(i => {
              return (
                <Item
                  className={s.SelectItem}
                  key={i.id}
                  onPointerLeave={event => event.preventDefault()}
                  onPointerMove={event => event.preventDefault()}
                  value={i.title}
                >
                  <Typography.Body1 className={s.SelectItemTextLeft}>
                    {i.description}
                  </Typography.Body1>
                  <Typography.Body1 className={s.SelectItemTextRight}>{i.title}</Typography.Body1>
                </Item>
              )
            })}
          </Viewport>
          <ScrollDownButton className={s.SelectScrollButton}></ScrollDownButton>
        </Content>
      </Portal>
    </Root>
  )
}
