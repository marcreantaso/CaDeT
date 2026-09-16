import { PWAUpdateNotice } from "./components/shared/PWAUpdateNotice"
import { StrictMode } from 'react'
import { MotionConfig } from 'framer-motion'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { setupPWA } from './pwa-setup'

setupPWA()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <App />
        <PWAUpdateNotice />
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
)
