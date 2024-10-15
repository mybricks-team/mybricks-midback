import React, { useEffect, lazy, useState, Suspense } from 'react'
import ReactDOM from 'react-dom'
// import App from './App'
import { RenderComCDN } from '../constants'

import { deps, getLocalDeps } from '../constants'
import { loadCjs, loadJSPure } from '../utils/loadCjs'
import { message } from 'antd'
const urls = [
  'https://w1.beckwai.com/kos/nlav12333/cdm-thumbnai/Button_Wed0.34476.js'
]
// const testComponentCDN = 'https://cdnfile.corp.kuaishou.com/kc/files/a/kael-mui-demo/chrome-plugin-upload/2024-10-10/1728549620663.29107bb955701aaa.js'
// // import {} from '@'

export function RendererJsDemo() {
  let newDeps = getLocalDeps(deps, {})

  const [Com, setCom] = useState(undefined)
  let cloudRef
  const Comp4 = lazy(() => loadJSPure(urls[0], newDeps))
  // console.log(json)
  useEffect(() => {
    console.log('111')
    loadJSPure(RenderComCDN, newDeps).then(res => {
      console.log('res === loadJs ',res)
      setCom(res.default)
    })

  }, [])
  console.log('Com', Com)
  const testProp = {
    label1: '测试111',
    label2: '测试222',
    label3: '测试333'
  }
  const comp4Props ={
    label1: '传入的标签1',
    label2: '传入的标签2',
    label3: '传入的标签3',
    label4: '熊出没',
    textClick: () => {
      message.info('点击了文本进行按钮加载设置')
      cloudRef?.setLoading(!cloudRef.loading)
    },
    getRef: (ref) => {
      cloudRef = ref
    }
  }
  
  return (
    <div>
      <div>Demo Load JsPure</div>
      <div>ll</div>
      {Com && <Com  {...testProp} />}
      <Suspense fallback={<div>Loading...</div>}>
        <Comp4 {...comp4Props} />
      </Suspense>
    </div>
  )
}

