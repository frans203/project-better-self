import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { initSession } from './shared/lib/session'
import './index.css'

// Antes do render: o guard le `ready` no primeiro frame e precisa que a
// leitura do storage ja esteja a caminho.
initSession()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
