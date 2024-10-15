import React, { useEffect, lazy, useState, Suspense } from 'react'
import ReactDOM from 'react-dom'
import { RenderComCDN } from './constants'
import { Divider, message } from 'antd'
import RendererUrlCom from './RenderUrlCom'
import { deps, getLocalDeps } from './constants'
// // import {} from '@'

console.log('reactDom', ReactDOM)
// DemoUrl resourceCode=Button_Wed_1
const DemoUrl = 'https://w1.beckwai.com/kos/nlav12333/cdm-thumbnai/Button_Wed0.34476.js'

// 搭建地址 https://lingzhu.staging.kuaishou.com/sketch/lowCode/designer/?appKey=yzj_letter_com_group&outAppKey=letter_com_group&tenant=yzj&orderId=2428901041503&resourceCode=local_btn_1&use-declare=1
const DemoUrl2 = 'https://w1.beckwai.com/kos/nlav12333/cdm-thumbnai/local_btn0.49611.js'
const container = document.getElementById('root')
// react 18
// const root = ReactDOM.createRoot(container)

// root.render(<MyApp />)

// react 17

ReactDOM.render(<MyApp />, document.getElementById('root'));
function MyApp() {
  return <RendererDemo />
}


function RendererDemo() {
  let newDeps = getLocalDeps(deps, {})

  const [Com, setCom] = useState(undefined)

  let cloudRef, cloudRenderRef, cloudDemoUrl2Ref

  const RenderComCDNProps = {
    label1: '测试111',
    label2: '测试222',
    label3: '测试333',
    getRef: (ref) => {
      cloudRenderRef = ref
    },
    click: () => {
      message.success('成功点击')
    }
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

  const DemoUrl2Props = {
    label: '啦啦啦-外部',
    btn: '啦啦啦-按钮',
    click: () => {
      message.success('点击')
    },
    calClick: () => {
      message.success('调用---')
    },
    getRef:(ref) => {
      cloudDemoUrl2Ref = ref
    }
  }
  return (
    <div>
      <div>Hello 渲染云组件 Demo </div>
      {/* <RendererJsDemo  /> */}
      <RendererUrlCom url={RenderComCDN} comProps={RenderComCDNProps}  />
      <Divider />
      <RendererUrlCom url={DemoUrl} comProps={comp4Props}  />
      <Divider />
      <RendererUrlCom url={DemoUrl2} comProps={DemoUrl2Props}  />
      <Divider />



    </div>
  )
}



