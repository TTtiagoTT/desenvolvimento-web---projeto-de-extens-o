import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Mantenha este
import App from './App.jsx'

// A linha 'import './App.css'' foi removida.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)