import React, { ComponentPropsWithoutRef, FC, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'

// import NostrChatWidget from 'nostr-chat-widget-react'

import { clsx } from 'clsx'

import { Test } from '~/shared/test'
import Typography from '~/shared/typography/typography'

import s from './nostr_.module.scss'

const nostrTitle = 'Nostr'

type Props = ComponentPropsWithoutRef<'div'>
export const Nostr_: FC<Props> = ({ className, ...rest }) => {
  // const css = 'theme--dark'
  //
  // useEffect(() => {
  //   const script = document.createElement('script')
  //
  //   script.type = 'text/javascript'
  //   script.async = true
  //   script.src = 'https://cdn.jsdelivr.net/gh/nostrband/nostr-embed@0.1.16/dist/nostr-embed.js'
  //
  //   const options = {
  //     hideNostrich: false,
  //     showCopyAddr: false,
  //     showFollowing: true,
  //     showZaps: true,
  //   }
  //
  //   script.onload = () => {
  //     nostrEmbed.init(
  //       'npub1jvxk2z0q2292pskwytvx8xusvxvcsa69g35tetqnlxjrgdvqfagqw7smgr',
  //       '#nostr-embed-npub1jvxk2z0q2292pskwytvx8xusvxvcsa69g35tetqnlxjrgdvqfagqw7smgr',
  //       '',
  //       options
  //     )
  //
  //     // Добавление стиля (цвета шрифта) к элементу
  //     const nostrEmbedElement = document.getElementById(
  //       'nostr-embed-npub1jvxk2z0q2292pskwytvx8xusvxvcsa69g35tetqnlxjrgdvqfagqw7smgr'
  //     )
  //     // if (nostrEmbedElement) {
  //     //     // nostrEmbedElement.style.color = 'red';
  //     //     // nostrEmbedElement.style.background = 'yellow';
  //     //     // nostrEmbedElement.style.border = '1px solid green';// Замените 'red' на ваш желаемый цвет
  //     // }
  //   }
  //
  //   const firstScript = document.getElementsByTagName('script')[0]
  //
  //   firstScript.parentNode?.insertBefore(script, firstScript)
  //
  //   firstScript.parentNode?.insertBefore(script, firstScript)
  //
  //   return () => {
  //     script.parentNode?.removeChild(script)
  //   }
  // }, [])

  return (
    <div className={clsx(s.NostrRoot, className)} {...rest}>
      <Typography.H2 className={s.NostrTitle}>{nostrTitle}</Typography.H2>
      {/*<iframe*/}
      {/*  className={'nostr-embedded'}*/}
      {/*  src={*/}
      {/*    'https://njump.me/naddr1qqxnzd3cxqmrzv3exgmr2wfeqy08wumn8ghj7mn0wd68yttsw43zuam9d3kx7unyv4ezumn9wshszyrhwden5te0dehhxarj9ekk7mf0qy88wumn8ghj7mn0wvhxcmmv9uq3zamnwvaz7tmwdaehgu3wwa5kuef0qy2hwumn8ghj7un9d3shjtnwdaehgu3wvfnj7q3qdergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsxpqqqp65wy2vhhv?embed=yes'*/}
      {/*  }*/}
      {/*  style={{ height: '298.5px', width: '100%' }}*/}
      {/*></iframe>*/}
      {/*<iframe*/}
      {/*  className={s.NostrIframe}*/}
      {/*  src={*/}
      {/*    'https://njump.me/nevent1qqstqdsqsgtc045jgaeeat4un6kzhjp7nrn7tq6e5cvsac2r4rh44hqppamhxue69uhkummnw3ezumt0d5pzpycdv5y7q5525rpvugkcvwdeqcve3pm523rghjkp87dyxs6cqn6sqvzqqqqqqy6vvvyc?embed=yes'*/}
      {/*  }*/}
      {/*  style={{ height: '100%' }}*/}
      {/*  title={'Nostr iframe'}*/}
      {/*></iframe>*/}
    </div>
  )
}
