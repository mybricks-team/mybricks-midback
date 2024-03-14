import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { message, Modal, Input, Typography, Calendar } from 'antd'
import css from './css.less'
import servicePlugin, {
  call as callConnectorHttp,
} from '@mybricks/plugin-connector-http' //连接器插件和运行时
import htmlTpt from './pub-tpt.html'
import tools from '@mybricks/plugin-tools'
import PcSpaDesigner, { type ComLibType, MaterialServerConfig } from '@mybricks/mybricks-pcspa-sdk'


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
  const [pageContent, setPageContent] = useState({
    fileName: '测试',
    absoluteNamePath: '/test',
    isDebugPermissionEnabled: false,
    pageSchema: {},
    envList: [],
    executeEnv: '',
    MYBRICKS_HOST: {},
    i18nLangContent: {},
    directConnection: false,
    i18nUsedIdList: [],
    comlibs: [
      'https://assets.mybricks.world/comlibs/mybricks.normal-pc/1.5.25/2024-03-04_20-51-40/edit.js',
      `https://assets.mybricks.world/comlibs/mybricks.basic-comlib/1.1.16/2024-03-01_16-59-05/edit.js`
    ],
    debugMockConfig: {
      debugQuery: {},
      debugMainProps: {},
      localStorageMock: [],
      debugHeaders: [],
      sessionStorageMock: [],
    }
  })

  const [comLibs, setComLibs] = useState<Array<ComLibType>>([
    {
      id: "",
      namespace: "mybricks.normal-pc",
      title: "通用PC组件库",
      editJs: "https://assets.mybricks.world/comlibs/mybricks.normal-pc/1.5.25/2024-03-04_20-51-40/edit.js"
    },
    {
      id: "313",
      namespace: 'mybricks.basic-comlib',
      title: "基础组件库",
      editJs: 'https://assets.mybricks.world/comlibs/mybricks.basic-comlib/1.1.16/2024-03-01_16-59-05/edit.js',
      latestComlib: {
        id: "313",
        namespace: 'mybricks.basic-comlib',
        title: "基础组件库",
        version: "1.1.20",
        editJs: 'https://assets.mybricks.world/comlibs/mybricks.basic-comlib/1.1.20/2024-03-11_15-47-14/edit.js'
      }
    }
  ]);

  const [gptOpen, setGptOpen] = useState(false)
  const [gptValue, setGptValue] = useState('')

  useLayoutEffect(() => {
    const searchParam = getQuery()
    let contentStr = window.localStorage.getItem(
      `--mybricks--${searchParam ? searchParam : ''}`
    )

    if (contentStr) {
      contentStr = JSON.parse(contentStr)

      setPageContent({
        ...pageContent,
        ...contentStr
      })
    } else {
      setPageContent({
        ...pageContent,
        pageSchema: {}
      })
    }
  }, [])


  const save = useCallback(() => {
    //保存
    const json = designerRef.current?.dump()
    const searchParam = getQuery()

    console.log({
      ...pageContent,
      pageSchema: json
    })
    console.log(`pageContent`, pageContent)
    window.localStorage.setItem(
      `--mybricks--${searchParam ? searchParam : ''}`,
      JSON.stringify({
        ...pageContent,
        pageSchema: json
      })
    )
    message.info(`保存完成`)
  }, [pageContent])

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
          {
            pageContent.pageSchema && (
              <PcSpaDesigner
                pageContent={pageContent}
                ref={designerRef}
                useLocalResources={{
                  editorOptions: {},
                  themeCss: ['/public/antd/antd@4.21.6.variable.min.css']
                }}
                editorItems={(items) => { // 返回预置editors，同时支持修改
                  console.log(items)
                  items['cate0'].title = '测试'

                  return items
                }}
                plugins={((plugins) => {
                  return plugins
                })}
                envExtra={{ // 扩展额外的 env
                  test: () => {
                    console.log('123')
                  }
                }}
                material={{
                  comLibs,
                  config: {
                    onDeleteComLib(lib, libs) {
                      console.log(lib, libs)
                    },
                    onUpgradeComLib(lib, libs) {
                      console.log(lib, libs)
                    },
                    onAddComLib(lib, libs) {

                    },
                  }
                }}
              />
            )
          }
        </div>
      </div>
    </>
  )
}