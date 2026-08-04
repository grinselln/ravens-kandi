import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.scss'
import { SessionProvider } from './components/Admin/Providers/SessionProvider'
import { DeleteModalProvider } from './components/Admin/Providers/DeleteModalProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <DeleteModalProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DeleteModalProvider>
    </SessionProvider>
  </StrictMode>,
)