import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { message, Modal, Input, Typography, Calendar } from 'antd'
import css from './css.less'
import htmlTpt from './pub-tpt.html'
import localePlugin from '@mybricks/plugin-locale'
import tools from '@mybricks/plugin-tools'
import { upgradeLibComlibsData, latestComlibData,  localComlibData } from './data'
import PcSpaDesigner, {
  type ComLibType,
  MaterialServerConfig,
} from '@mybricks/mybricks-pcspa-sdk'

const getQuery = () => {
  return location.search.replace(/\?/, '')
}

export default function MyDesigner() {
  const designerRef = useRef<{ switchActivity; dump; toJSON }>()
  const [pageContent, setPageContent] = useState({
    fileName: '测试',
    absoluteNamePath: '/test',
    isDebugPermissionEnabled: false,
    pageSchema: null,
    envList: [],
    executeEnv: '',
    MYBRICKS_HOST: {},
    i18nLangContent: {},
    directConnection: false,
    i18nUsedIdList: [],
    comlibs: [
      'https://assets.mybricks.world/comlibs/mybricks.normal-pc/1.5.25/2024-03-04_20-51-40/edit.js',
      `https://assets.mybricks.world/comlibs/mybricks.basic-comlib/1.1.16/2024-03-01_16-59-05/edit.js`,
    ],
    debugMockConfig: {
      debugQuery: {},
      debugProps: {},
      localStorageMock: [],
      debugHeaders: [],
      sessionStorageMock: [],
    },
  })

  const [comLibs, setComLibs] = useState<Array<ComLibType>>([
    {
      id: '12',
      namespace: 'mybricks.normal-pc',
      title: '通用PC组件库',
      editJs:
        // 'https://assets.mybricks.world/comlibs/mybricks.normal-pc/1.5.25/2024-03-04_20-51-40/edit.js',
        'http://localhost:8001/libEdt.js',
    },
    {
      id: '313',
      namespace: 'mybricks.basic-comlib',
      title: '基础组件库',
      editJs:
        'https://assets.mybricks.world/comlibs/mybricks.basic-comlib/1.1.16/2024-03-01_16-59-05/edit.js',
      latestComlib: {
        id: '313',
        namespace: 'mybricks.basic-comlib',
        title: '基础组件库',
        version: '1.1.20',
        editJs:
          'https://assets.mybricks.world/comlibs/mybricks.basic-comlib/1.1.20/2024-03-11_15-47-14/edit.js',
      },
    },
  ])

  const [gptOpen, setGptOpen] = useState(false)
  const [gptValue, setGptValue] = useState('')

  useLayoutEffect(() => {
    const searchParam = getQuery()
    let contentStr = window.localStorage.getItem(
      `--mybricks--${searchParam ? searchParam : ''}`
    )

    if (contentStr) {
      contentStr = JSON.parse(contentStr)
      console.log(contentStr)
      setPageContent({
        ...pageContent,
        ...contentStr,
      })
    } else {
      setPageContent({
        ...pageContent,
        pageSchema: {},
      })
    }
  }, [])

  const save = useCallback(() => {
    //保存
    const json = designerRef.current?.dump()
    const searchParam = getQuery()

    console.log({
      ...pageContent,
      pageSchema: json,
    })
    console.log(`pageContent`, pageContent)
    window.localStorage.setItem(
      `--mybricks--${searchParam ? searchParam : ''}`,
      JSON.stringify({
        ...pageContent,
        pageSchema: json,
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
    const pageSchema = designerRef.current?.toJSON()
    let html = htmlTpt.replace(`--title--`, title) //替换
    html = html.replace(`'--pageSchema--'`, JSON.stringify(pageSchema)) //替换
    html = html.replace(
      `--comlib-rt--`,
      `https://f2.eckwai.com/kos/nlav12333/fangzhou/pub/comlibs/5665_1.1.12/2023-03-31_12-19-17/rt.js`
    ) //替换

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
          {pageContent.pageSchema && (
            <PcSpaDesigner
              pageContent={pageContent}
              ref={designerRef}
              useLocalResources={{
                editorOptions: {},
                themeCss: ['/public/antd/antd@4.21.6.min.css'],
              }}
              editorItems={(items) => {
                // 返回预置editors，同时支持修改
                console.log(items)
                items['cate0'].title = '测试'

                return items
              }}
              plugins={(plugins) => {
                const index = plugins.findIndex(
                  (item) => item.name === 'locale'
                )
                const newPlugins = plugins.splice(index, 1)
                return newPlugins
              }}
              envExtra={{
                // 扩展额外的 env
                test: () => {
                  console.log('123')
                },
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
                    console.log(lib, libs)
                    return {} as any
                  },
                },
              }}
            />
          )}
        </div>
      </div>
    </>
  )
}
