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

const getDefaultItems = (context) => {
  const { pageContent } = context

  return {
    cate0: {
      title: '项目',
      items: [
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
                }
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
        {
          title: '调试',
          items: [
            {
              title: '权限校验',
              type: 'Switch',
              description: '调试模式下，是否开启权限校验',
              value: {
                get() {
                  return pageContent.isDebugPermissionEnabled
                },
                set(context, v) {
                  pageContent.isDebugPermissionEnabled = v
                }
              }
            },
          ]
        }
      ]
    }
  }
}

export default getDefaultItems