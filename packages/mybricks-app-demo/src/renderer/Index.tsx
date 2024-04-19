import React from 'react'
import ReactDOM from 'react-dom'

import Renderer from '@mybricks/renderer-pc'
// import {} from '@'
import json from './demo.json'

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container)

root.render(<MyApp />)

function MyApp() {
  return <RendererDemo />
}

// 组件库依赖
// window.__comlibs_rt_ = []

const executeEnv = '--executeEnv--'
const envList = '--envList--'
const i18nLangContent = '--i18nLangContent--'

const getCurrentLocale = () => {
  // 当前语言
  return navigator.language
}

function RendererDemo() {
  console.log(json)
  return (
    <div>
      <Renderer
        comDefs={{}}
        json={json}
        config={{
          executeEnv,
          envList,
          i18nLangContent,
          locale: getCurrentLocale(),
        }}
      />
    </div>
  )
}
