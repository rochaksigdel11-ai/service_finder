// src/main.tsx — FINAL 100% WORKING VERSION
import React from 'react'
import './index.css'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AppProvider } from './context/AppContext'   // ← THIS WAS MISSING!!!

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>          {/* ← THIS LINE SAVES EVERYTHING */}
      <App />
    </AppProvider>
  </React.StrictMode>
)