import React, { useCallback, useRef, useState } from 'react'
import { message, Modal, Input, Typography, Calendar } from 'antd'
import css from './css.less'
import servicePlugin, {
  call as callConnectorHttp,
} from '@mybricks/plugin-connector-http' //连接器插件和运行时
import htmlTpt from './pub-tpt.html'
import tools from '@mybricks/plugin-tools'
import PcSpaDesigner from 'mybricks-pcspa-sdk'


const getQuery = () => {
  return location.search.replace(/\?/, '')
}

// const Designer = window.mybricks.SPADesigner

/**
 * 配置设计器
 */
// const config = ({ save }) => {
//   return {
//     shortcuts: {
//       'ctrl+s': [save]
//     },
//     plugins: [
//       servicePlugin(),
//       tools(),
//     ],
//     comLibLoader(desc) {
//       //加载组件库
//       return new Promise((resolve, reject) => {

//         resolve([
//           // 'http://localhost:8002/libEdt.js',
//           // 'http://localhost:8001/libEdt.js',
//           // 'https://f2.eckwai.com/kos/nlav12333/fangzhou/pub/comlibs/7182_1.0.92/2023-11-30_11-43-16/edit.js',
//           'https://assets.mybricks.world/comlibs/mybricks.normal-pc/1.4.46/2023-12-12_11-53-35/edit.js'
//         ])
//       })
//     },
//     pageContentLoader() {
//       //加载页面内容
//       // const pageContent = window.localStorage.getItem('--mybricks--')
  
//       return new Promise((resolve, reject) => {
//         const searchParam = getQuery()
//         let pageContent = window.localStorage.getItem(
//           `--mybricks--${searchParam ? searchParam : ''}`
//         )
//         if (pageContent) {
//           pageContent = JSON.parse(pageContent)
  
//           resolve(pageContent)
//         } else {
//           resolve({})
//         }
//       })
//     },
//     geoView: {//配置布局视图
//       nav: {float: false},
//       scenes: {
//         adder: [
//           {
//             type: 'popup',
//             title: '对话框',
//             template: {
//               namespace: 'mybricks.basic-comlib.popup',
//               deletable: false,
//               asRoot: true
//             }
//           }
//         ]
//       },
//     },
//     toplView: {
//       title: '交互',
//       cards: {
//         main: {
//           title: '页面',
//         },
//       },
//       globalIO: {
//         startWithSingleton: true,
//       },
//       vars: {},
//       fx: {},
//       useStrict: false,
//     },
//     com: {
//       //组件运行配置
//       env: {
//         i18n(title) {
//           //多语言
//           return title
//         },
//         callConnector(connector, params) {
//           //调用连接器
//           if (connector.type === 'http') {
//             //服务接口类型
//             return callConnectorHttp(connector, params, {
//               // 发送请求前的钩子函数
//               before(options) {
//                 return {
//                   ...options,
//                 }
//               },
//             })
//           } else {
//             return Promise.reject('错误的连接器类型.')
//           }
//         },
//         get getRouter() {
//           const toast = (info: string) => {
//             message.info(info);
//           };
//           return () => ({
//             reload: () => toast('reload'),
//             redirect: ({ url }: { url: string }) => toast(`redirect: ${url}`),
//             back: () => toast('back'),
//             forward: () => toast('forward'),
//             pushState: ({
//               state,
//               title,
//               url,
//             }: {
//               state: any;
//               title: string;
//               url: string;
//             }) =>
//               toast(`pushState: ${JSON.stringify({ state, title, url })}`),
//             openTab: ({ url, title }: { url: string; title: string }) =>
//               toast(`open a new tab: ${JSON.stringify({ url, title })}`),
//           });
//         },
//       },
//       events: [
//         //配置事件
//         {
//           type: 'jump',
//           title: '跳转到',
//           exe({ options }) {
//             const page = options.page
//             if (page) {
//               window.location.href = page
//             }
//           },
//           options: [
//             {
//               id: 'page',
//               title: '页面',
//               editor: 'textarea',
//             },
//           ],
//         },
//       ],
//     },
//   }
// }

export default function MyDesigner() {
  const designerRef = useRef<{ switchActivity; dump; toJSON }>()
  const [pageContent] = useState({
    fileName: '测试',
    absoluteNamePath: '/test'
  })

  const [gptOpen, setGptOpen] = useState(false)
  const [gptValue, setGptValue] = useState('')


  const save = useCallback(() => {
    //保存
    console.log(designerRef.current?.dump(), pageContent)
    // const json = designerRef.current?.dump()
    // const searchParam = getQuery()

    // window.localStorage.setItem(
    //   `--mybricks--${searchParam ? searchParam : ''}`,
    //   JSON.stringify(json)
    // )
    // message.info(`保存完成`)
  }, [])

  /**
   * 预览
   */
  const preview = useCallback(() => {
    //从设计器中获取DSL（JSON）
    const json = designerRef.current?.toJSON()

    window.localStorage.setItem('--preview--', JSON.stringify(json))

    const win = window.open('', 'preview')
    if (win.location.href === 'about:blank') {
      window.open('/preview.html', 'preview')
    } else {
      win.focus()
    }
  }, [])

  /**
   * 发布（导出）
   */
  const publish = useCallback(() => {
    const title = '我的页面' //页面标题
    const json = designerRef.current?.toJSON()
    let html = htmlTpt.replace(`--title--`, title) //替换
    html = html.replace(`'-projectJson-'`, JSON.stringify(json)) //替换

    //-----------------------------------------------

    const linkNode = document.createElement('a')
    linkNode.download = `${title}.html`
    linkNode.style.display = 'none'
    const blob = new Blob([html])
    linkNode.href = URL.createObjectURL(blob)

    document.body.appendChild(linkNode)
    linkNode.click()

    document.body.removeChild(linkNode)
  }, [])

  return (
    <>
      <div className={css.show}>
        <div className={css.toolbar}>
          <div className={css.tt}>&lt;您自己的应用标题&gt;</div>
          <button className={css.primary} onClick={save}>
            保存
          </button>
          <button onClick={preview}>预览</button>
          <button onClick={publish}>发布到本地</button>
        </div>
        <div className={css.designer}>
          <PcSpaDesigner pageContent={pageContent} ref={designerRef} />
          {/* <PcSpaDesigner /> */}
        </div>
      </div>
    </>
  )
}