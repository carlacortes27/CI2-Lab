import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { RedirectProvider } from './context/RedirectContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RedirectProvider>
        <App />
      </RedirectProvider>
    </AuthProvider>
  </StrictMode>,
)
