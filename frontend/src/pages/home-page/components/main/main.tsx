import React from 'react'

import { Connect } from '~/pages/home-page/components/main/connect'
import { Info } from '~/pages/home-page/components/main/info'
import { Partners } from '~/pages/home-page/components/main/partners'
import { Nostr_ } from '~/pages/home-page/components/nostr_'
import { Route_ } from '~/pages/home-page/components/route_'
import Typography from '~/shared/typography/typography'
import { mainData } from '~/shared/variables'

import 'react-toastify/dist/ReactToastify.css'

import s from './main.module.scss'

export const Main = () => {
  // const { infoTextEnd, infoTextMiddle, infoTextStart } = mainData

  return (
    <main className={s.MainRoot}>
      {/*<Typography.Body1 className={s.MainText}>*/}
      {/*  {infoTextStart}*/}
      {/*  <Typography.Body6 className={s.MainAccentText}>{infoTextMiddle}</Typography.Body6>*/}
      {/*  {infoTextEnd.split('&nbsp;').map((text, index) => (*/}
      {/*    <React.Fragment key={index}>*/}
      {/*      {text}*/}
      {/*      {index !== mainData.infoTextEnd.split('&nbsp;').length - 1 && <span>&nbsp;</span>}*/}
      {/*    </React.Fragment>*/}
      {/*  ))}*/}
      {/*</Typography.Body1>*/}
      <div className={s.MainWrapper}>
        <Connect className={s.MainConnect} />
        {/*<Info className={s.MainInfo} />*/}
        <Route_ className={s.MainRoute} />
        {/*<Nostr_ className={s.MainNostr} />*/}
        <Partners className={s.MainPartners} />
      </div>
    </main>
  )
}
