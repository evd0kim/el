import React, { ComponentPropsWithoutRef, useEffect, useRef } from 'react'
import ReactDatePicker from 'react-datepicker'
import { Controller, FieldValues, UseControllerProps, useController } from 'react-hook-form'

import 'react-datepicker/dist/react-datepicker.css'

import s from './control-input.module.scss'

type Props<T extends FieldValues> = UseControllerProps<T> &
  ComponentPropsWithoutRef<'input'> & { setInputWidth?: any }

export const ControlInput = <T extends FieldValues>({
  control,
  defaultValue,
  disabled,
  minDate,
  name,
  onBlur: externalOnBlur,
  onChange: externalOnChange,
  rules,
  setInputWidth,
  shouldUnregister,
  type,
  ...rest
}: Props<T> & { minDate?: Date }) => {
  const { field } = useController({
    control,
    defaultValue,
    disabled,
    name,
    rules,
    shouldUnregister,
  })

  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const handleResize = () => {
      if (inputRef.current && setInputWidth) {
        setInputWidth(inputRef.current.offsetWidth)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [inputRef, setInputWidth])

  if (type === 'date') {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onBlur, onChange, ref, value } }) => (
          <ReactDatePicker
            className={`${s.picker}`}
            disabled={disabled}
            minDate={minDate}
            onBlur={onBlur}
            onChange={onChange}
            selected={new Date(field.value)}
          />
        )}
      />
    )
  }

  return (
    <input
      {...field}
      disabled={disabled}
      ref={el => {
        field.ref(el)
        inputRef.current = el
      }}
      type={type}
      {...rest}
    />
  )
}
