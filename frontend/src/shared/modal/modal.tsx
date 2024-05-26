import React, { useEffect } from 'react'

import s from './modal.module.scss'

type Props = {
  onClose: () => void
}

export const Modal = ({ onClose }: Props) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (event.target === event.currentTarget) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [onClose])

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modal} onClick={e => e.stopPropagation()}>
        <div>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
