import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 💡 เพิ่มตัวนี้เข้ามา
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* 💡 ครอบ App ไว้ที่นี่เพื่อให้ใช้ useNavigate ได้ */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)