import React, { ComponentPropsWithoutRef, FC, useState } from 'react'

import { clsx } from 'clsx'

import { MetaMask } from '~/pages/home-page/components/main/connect/meta-mask'
import { Modal } from '~/shared/modal'

import s from './connect.module.scss'

type Props = ComponentPropsWithoutRef<'div'>
export const Connect: FC<Props> = ({ className, ...rest }) => {
  const [modalOpen, setModalOpen] = useState(false)

  const openModal = () => {
    setModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setModalOpen(false)
    document.body.style.overflow = 'auto'
  }

  return (
    <div className={clsx(s.ConnectRoot, className)} {...rest}>
      <MetaMask />
      {modalOpen && <Modal onClose={closeModal} />}
    </div>
  )
}
