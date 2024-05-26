import React from 'react'
import { Provider } from 'react-redux'

import ReactDOM from 'react-dom/client'

import { store } from '~/services/store'

import './styles/index.scss'

import { App } from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // /*  <React.StrictMode>*/
  <Provider store={store}>
    <App />
  </Provider>
  /*</React.StrictMode>*/
)
