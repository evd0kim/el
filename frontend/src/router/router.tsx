import { RouteObject, RouterProvider, createBrowserRouter } from 'react-router-dom'

import { HomePage } from '~/pages/home-page'
import { NotFoundPage } from '~/pages/not-found'

const routes: RouteObject[] = [
  {
    element: <HomePage />,
    path: '/',
  },
  {
    element: <NotFoundPage />, // Передаем компонент, а не элемент JSX
    path: '/*',
  },
]

const router = createBrowserRouter(routes)

export const Router = () => {
  return <RouterProvider router={router} />
}
