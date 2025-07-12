import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'
import { DataLoader } from './services/dataLoader'

// Load sample data - this will only load tasks from July 1, 2025 onwards
DataLoader.loadNursingData();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)