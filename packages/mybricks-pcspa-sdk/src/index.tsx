import React, { forwardRef, useMemo } from 'react'
import getDefaultItems from './defaultEditConfig'
import getDebugEnv from './initialDebugEnv'

export interface PageContent {
  fileName?: string
  absoluteNamePath?: string
  hasPermissionFn?: string
  pageSchema: Record<string, any>
  isDebugPermissionEnabled?: boolean
  [key: string]: any
}

export interface SdkContext {
  pageContent: PageContent
  designerRef: any
}

interface PcSpaDesignerProps {
  useLocalResources?: {
    editorOptions?: any
    themeCss?: string[]
  }
  editorItems?: (items: any) => any
  plugins?: (plugins: any) => any[]
  pageContent?: PageContent
  envExtra?: Record<string, any>
  // ... toplView shortcuts events
}

const SPADesigner = (window as any).mybricks.SPADesigner


const PcSpaDesigner = forwardRef((props: PcSpaDesignerProps, ref: any) => {
  console.log('forwardRef props---', props)
  const { pageContent, useLocalResources, editorItems, envExtra } = props
  const sdkContext = {
    pageContent,
    designerRef: ref,
    getCurrentLocale: () => {
      return `zh`
    }
  }
  const config = useMemo(() => {
    console.log('config------', pageContent.pageSchema)
    
    const env =  {
      ...getDebugEnv(sdkContext),
      ...envExtra
    }

    const defaultItems = getDefaultItems(sdkContext)
    
    let editViewItems = defaultItems
    
    if (editorItems) {
      editViewItems = editorItems(defaultItems)
    }

    return {
      shortcuts: {},
      plugins: [],
      comLibLoader(desc) { // Todo
        //加载组件库
        return new Promise((resolve, reject) => {
          resolve([
            'https://assets.mybricks.world/comlibs/mybricks.normal-pc/1.4.46/2023-12-12_11-53-35/edit.js',
          ])
        })
      },
      pageContentLoader () {
        return new Promise((resolve) => {
          resolve(pageContent.pageSchema || {})
        })
      },
      toplView: {
        title: '交互',
        cards: {
          main: {
            title: '页面',
          },
        },
        globalIO: {
          startWithSingleton: true,
        },
        vars: {},
        fx: {},
        useStrict: false,
      },
      editView: {
        items({}, cate0) {
          cate0.title = editViewItems['cate0'].title
          cate0.items = editViewItems['cate0'].items
        },
        editorOptions: useLocalResources?.editorOptions
      },
      geoView: {
        scenes: {},
        theme: {
          css: useLocalResources?.themeCss,
        },
      },
      com: {
        env,
        events: [
          {
            type: 'jump',
            title: '跳转到',
            exe({ options }) {
              const page = options.page
              if (page) {
                window.location.href = page
              }
            },
            options: [
              {
                id: 'page',
                title: '页面',
                editor: 'textarea',
              },
            ],
          },
        ],
      },
    }
  }, [])

  return (
    <SPADesigner ref={ref} config={config} ></SPADesigner>
  )
})

export {
  
}

export default PcSpaDesigner
