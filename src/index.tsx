import React from 'react'
import './css/index.scss'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
