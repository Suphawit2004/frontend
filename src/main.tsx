import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 💡 1. นำเข้า BrowserRouter จาก react-router-dom
import { BrowserRouter } from 'react-router-dom' 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 💡 2. เอา BrowserRouter มาครอบ Component <App /> เอาไว้ครับ */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)