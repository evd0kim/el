import { ChangeEvent, ComponentPropsWithoutRef, FocusEvent, useEffect, useRef } from 'react'
import { FieldValues, UseControllerProps, useController } from 'react-hook-form'

type Props<T extends FieldValues> = UseControllerProps<T> &
  ComponentPropsWithoutRef<'input'> & { setInputWidth?: any }

export const ControlInput = <T extends FieldValues>({
  control,
  defaultValue,
  disabled,
  name,
  onBlur: externalOnBlur,
  onChange: externalOnChange,
  rules,
  setInputWidth,
  shouldUnregister,
  ...rest
}: Props<T>) => {
  const {
    field: { onBlur: internalOnBlur, onChange: internalOnChange, ref, value },
  } = useController({
    control,
    defaultValue,
    disabled,
    name,
    rules,
    shouldUnregister,
  })

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleResize = () => {
      if (inputRef.current) {
        if (setInputWidth) {
          setInputWidth(inputRef.current.offsetWidth)
        }
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [ref])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    internalOnChange(event)
    if (externalOnChange) {
      externalOnChange(event)
    }
  }

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    internalOnBlur()
    if (externalOnBlur) {
      externalOnBlur(event)
    }
  }

  return (
    <input
      disabled={disabled}
      name={name}
      onBlur={handleBlur}
      onChange={handleChange}
      ref={el => {
        ref(el)
        inputRef.current = el
      }}
      value={value}
      {...rest}
    />
  )
}
