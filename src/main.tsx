import { StrictMode } from 'react'
import './i18n'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/surfaces.css'
import App from './App.tsx'
import { applyDocumentLang, resolveLang } from './i18n/storedLang'

// The remembered language is applied to <html> before the first paint.
applyDocumentLang(resolveLang());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)