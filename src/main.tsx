import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import  AppProvider  from './context/AppContext'
import AuthProvider from './context/AuthContext'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </AuthProvider>
)