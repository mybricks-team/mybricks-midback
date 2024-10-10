import React from 'react'
import ReactDOM from 'react-dom'

import XXX from 'https://w1.beckwai.com/kos/nlav12333/cdm-thumbnai/letetr_test_model0.96057.js'
// import Renderer from '@mybricks/renderer-pc'
// // import {} from '@'
// import json from './demo.json'

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container)

root.render(<MyApp />)

function MyApp() {
  return <RendererDemo />
}

function RendererDemo() {
  console.log(json)
  return (
    <div>
      <XXX label='啦啦啦' btnLabel="测试按钮" />
      {/* <Renderer
        comDefs={{}}
        json={json}
        config={{
          executeEnv,
          envList,
          i18nLangContent,
          locale: getCurrentLocale(),
        }}
      /> */}
    </div>
  )
}
