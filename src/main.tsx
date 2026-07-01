import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyTheme, useThemeStore } from '@/stores/themeStore'
import '@/styles/index.css'
import App from '@/App'

applyTheme(useThemeStore.getState().theme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
