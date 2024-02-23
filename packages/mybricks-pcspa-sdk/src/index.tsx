import React, { forwardRef, useMemo } from 'react'

interface PcSpaDesignerProps {
  useLocalResources?: any
  editorItems?: any
  plugins?: any
  pageContent?: {
    fileName: string
    absoluteNamePath: string
    hasPermissionFn: string
    [key: string]: any
  }
}

const SPADesigner = (window as any).mybricks.SPADesigner

const defaultPermissionComments = `/**
*
* interface Props {
*   key: string // 权限key
* }
*
* @param {object} props: Props
* @return {boolean}
*/
`

const defaultPermissionFn = `export default function ({ key }) {
  return true
}
`

const PcSpaDesigner = forwardRef((props: PcSpaDesignerProps, ref: any) => {
  console.log('forwardRef props---', props)
  const { pageContent } = props
  // const designerRef = useRef()

  // useImperativeHandle(ref, () => designerRef.current)

  const config = useMemo(() => {
    return {
      shortcuts: {},
      plugins: [],
      comLibLoader(desc) {
        //加载组件库
        return new Promise((resolve, reject) => {
          resolve([
            'https://assets.mybricks.world/comlibs/mybricks.normal-pc/1.4.46/2023-12-12_11-53-35/edit.js',
          ])
        })
      },
      pageContentLoader() {
        return new Promise((resolve) => {
          resolve({})
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
          cate0.title = `项目`
          cate0.items = [
            {
              items: [
                {
                  title: '名称',
                  type: 'Text',
                  value: {
                    get: (context) => {
                      return pageContent.fileName
                    },
                    set: (context, v: any) => {
                      if (v !== pageContent.fileName) {
                        pageContent.fileName = v
                      }
                    },
                  },
                },
                {
                  title: '文件路径',
                  type: 'Text',
                  options: { readOnly: true },
                  value: {
                    get: (context) => {
                      return pageContent.absoluteNamePath
                    },
                    set: (context, v: any) => {
                      if (v !== pageContent.absoluteNamePath) {
                        pageContent.absoluteNamePath = v
                      }
                    },
                  },
                },
              ],
            },
            {
              title: '全局方法',
              items: [
                {
                  title: '权限校验',
                  type: 'code',
                  description: '设置权限校验方法，调试模式下默认不会启用',
                  options: {
                    title: '权限校验',
                    comments: defaultPermissionComments,
                    displayType: 'button',
                  },
                  value: {
                    get() {
                      return decodeURIComponent(
                        pageContent?.hasPermissionFn ||
                          encodeURIComponent(defaultPermissionFn)
                      )
                    },
                    set(context, v: string) {
                      pageContent.hasPermissionFn = encodeURIComponent(v)
                    },
                  },
                },
              ],
            },
          ]
        },
      },
      geoView: {
        scenes: {},
        theme: {
          css: [],
        },
      },
      com: {
        env: {},
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
    <SPADesigner config={config} ref={ref}></SPADesigner>
  )
})

export default PcSpaDesigner
