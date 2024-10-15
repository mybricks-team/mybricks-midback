import React, { useEffect, lazy, useState, Suspense } from 'react'
import ReactDOM from 'react-dom'
// import App from './App'
// vite打包, APp 那个
import { RenderComCDN } from './constants'

import { deps, getLocalDeps } from './constants'
import { loadCjs, loadJSPure } from './utils/loadCjs'
import { message } from 'antd'
const urls = [
  'https://w1.beckwai.com/kos/nlav12333/cdm-thumbnai/Button_Wed0.34476.js'
]
// const testComponentCDN = 'https://cdnfile.corp.kuaishou.com/kc/files/a/kael-mui-demo/chrome-plugin-upload/2024-10-10/1728549620663.29107bb955701aaa.js'
// // import {} from '@'

export interface RendererUrlCom {
  /** 组件CDN 地址 */
  url: string
  /** 组件属性 */
  comProps: Record<string, any>
  // 搭建链接
  link?: string
}

export default  function RendererUrlCom(props: RendererUrlCom) {
  const { url = urls[0], comProps} = props
  let newDeps = getLocalDeps(deps, {})

  const [Com, setCom] = useState(undefined)
  const Comp4 = lazy(() => loadJSPure(url, newDeps))
  // console.log(json)
  console.log('Com', Com)

  
  return (
    <div>
      <div>Demo Load JsPure</div>
      <Suspense fallback={<div>Loading...</div>}>
        <Comp4 {...comProps} />
      </Suspense>
    </div>
  )
}

