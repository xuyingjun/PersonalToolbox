import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import StartupError from './components/ui/StartupError.jsx'
import { initDatabase } from './db/seed.js'
import './styles.css'

// 在 React 之外完成数据库初始化（避免 StrictMode 双执行播种逻辑）。
// 初始化失败也照常渲染，由页面的错误状态提示用户。
const root = createRoot(document.getElementById('root'))

initDatabase()
  .then(() => {
    root.render(
      <StrictMode>
        <HashRouter>
          <App />
        </HashRouter>
      </StrictMode>,
    )
  })
  .catch((error) => {
    console.error('数据库初始化失败：', error)
    root.render(<StartupError />)
  })
