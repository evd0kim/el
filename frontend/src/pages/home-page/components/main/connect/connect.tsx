import React, { ComponentPropsWithoutRef, FC, useState } from 'react'

import { clsx } from 'clsx'

import { Alby } from '~/pages/home-page/components/main/connect/alby'
import { MetaMask } from '~/pages/home-page/components/main/connect/meta-mask'
import { Button } from '~/shared/button'
import { Modal } from '~/shared/modal'
import { connectData } from '~/shared/variables'

import s from './connect.module.scss'

type Props = ComponentPropsWithoutRef<'div'>
export const Connect: FC<Props> = ({ className, ...rest }) => {
  const { button } = connectData
  const [modalOpen, setModalOpen] = useState(false)

  const openModal = () => {
    setModalOpen(true)
    // Запретить прокрутку страницы при открытии модального окна
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setModalOpen(false)
    document.body.style.overflow = 'auto'
  }

  return (
    <div className={clsx(s.ConnectRoot, className)} {...rest}>
      <Alby />
      <MetaMask />
      <Button className={s.ConnectButton} onClick={openModal} variant={'default'}>
        {button}
      </Button>
      {modalOpen && <Modal onClose={closeModal} />}
    </div>
  )
}
