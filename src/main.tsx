import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.scss'
import { SessionProvider } from './components/Admin/Providers/SessionProvider'
import { DeleteModalProvider } from './components/Admin/Providers/DeleteModalProvider'
import { AuthProvider } from './components/Admin/Providers/AuthProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <AuthProvider>
        <DeleteModalProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </DeleteModalProvider>
      </AuthProvider>
    </SessionProvider>
  </StrictMode>,
)