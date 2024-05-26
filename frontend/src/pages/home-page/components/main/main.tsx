import React from 'react'

import { Connect } from '~/pages/home-page/components/main/connect'
import { Route_ } from '~/pages/home-page/components/route_'

import 'react-toastify/dist/ReactToastify.css'

import s from './main.module.scss'

export const Main = () => {
  return (
    <main className={s.MainRoot}>
      <div className={s.MainWrapper}>
        <Connect className={s.MainConnect} />
        <Route_ className={s.MainRoute} />
        {/*<Partners className={s.MainPartners} />*/}
      </div>
    </main>
  )
}
