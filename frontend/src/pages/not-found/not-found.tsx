import { Helmet } from 'react-helmet'

import Typography from '~/shared/typography/typography'

import s from './not-found.module.scss'
export const NotFoundPage = () => {
  return (
    <div className={s.NotFoundRoot}>
      <Helmet>
        <title>404 Not Found</title>
        <meta
          content={
            'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'
          }
          name={'description'}
        />
      </Helmet>
      <Typography.H1>404</Typography.H1>
      <Typography.Body1>The requested URL was not found on this server.</Typography.Body1>
    </div>
  )
}
