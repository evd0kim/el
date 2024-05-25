import { useState } from 'react'
import { ToastContainer } from 'react-toastify'

import { Footer } from '~/pages/home-page/components/footer/footer'
import { Header } from '~/pages/home-page/components/header/header'
import { Main } from '~/pages/home-page/components/main/main'
import { Modal } from '~/shared/modal'

import 'react-toastify/dist/ReactToastify.css'

export const HomePage = () => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Header />
      <Main />
      <Footer />
      <ToastContainer
        autoClose={5000}
        closeOnClick
        draggable
        hideProgressBar={false}
        newestOnTop={false}
        pauseOnFocusLoss
        pauseOnHover
        position={'bottom-center'}
        rtl={false}
        theme={'dark'}
      />
    </>
  )
}
