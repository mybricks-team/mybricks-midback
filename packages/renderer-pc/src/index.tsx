// import React from 'react'
// import ReactDOM from 'react-dom'
import { render } from '@mybricks/render-web'
import { parseQuery } from './utils'
import { runJs } from '@mybricks/com-utils'

interface RendererProps {
  json: any
  config: {
    envList
    executeEnv
    locale
    i18nLangContent
  }
  comDefs: any
}

const USE_CUSTOM_HOST = '__USE_CUSTOM_HOST__'

export default function Renderer(props: RendererProps) {
  const { json, config, comDefs } = props
  const { envList, executeEnv, locale, i18nLangContent } = config

  const currentLocale = locale || navigator.language

  return render(json, {
    comDefs,
    env: {
      silent: true,
      showErrorNotification: false,
      // renderCom(json, opts, coms) { // 云组件咱不实现
      //   return renderUI(json, {
      //     comDefs: { ...getComs(), ...coms },
      //     ...(opts || {}),
      //   });
      // },
      callConnector(connector, params, connectorConfig = {}) {
        const plugin =
          window[connector.connectorName] || window['@mybricks/plugins/service']
        //@ts-ignore
        const MYBRICKS_HOST = window?.MYBRICKS_HOST

        if (isEqual(executeEnv, USE_CUSTOM_HOST)) {
          if (typeof MYBRICKS_HOST === 'undefined') {
            console.error(`没有设置window.MYBRICKS_HOST变量`)
            return
          } else if (!MYBRICKS_HOST.default) {
            console.error(`没有设置window.MYBRICKS_HOST.default`)
            return
          }
        }

        let newParams = params

        if (isEqual(executeEnv, USE_CUSTOM_HOST)) {
          if (params instanceof FormData) {
            newParams.append('MYBRICKS_HOST', JSON.stringify(MYBRICKS_HOST))
          } else {
            newParams = { ...params, MYBRICKS_HOST: { ...MYBRICKS_HOST } }
          }
        }
        if (plugin) {
          /** 兼容云组件，云组件会自带 script */
          const curConnector = connector.script
            ? connector
            : (json.plugins[connector.connectorName] || []).find(
                (con) => con.id === connector.id
              )

          return curConnector
            ? plugin.call({ ...connector, ...curConnector }, newParams, {
                ...connectorConfig,
                /** http-sql表示为领域接口 */
                before: (options) => {
                  return {
                    ...options,
                    url: shapeUrlByEnv(
                      envList,
                      executeEnv,
                      options.url,
                      MYBRICKS_HOST
                    ),
                  }
                },
              })
            : Promise.reject('接口不存在，请检查连接器插件中接口配置')
        } else {
          return Promise.reject('错误的连接器类型')
        }
      },
      i18n(title) {
        //多语言
        if (typeof title?.id === 'undefined') return title
        return (
          i18nLangContent[title.id]?.content?.[currentLocale] ||
          JSON.stringify(title)
        )
        //return title;
      },
      get vars() {
        // 环境变量
        return {
          get getExecuteEnv() {
            return () => executeEnv
          },
          get getQuery() {
            return () => {
              return parseQuery(location.search)
            }
          },
          //antd 语言包地址
          get locale() {
            return currentLocale
          },
          get getProps() {
            // 获取主应用参数方法，如：token等参数，取决于主应用传入
            return () => {
              if (!props) return undefined
              return props
            }
          },
          get getCookies() {
            return () => {
              const cookies = document.cookie.split('; ').reduce((s, e) => {
                const p = e.indexOf('=')
                s[e.slice(0, p)] = e.slice(p + 1)
                return s
              }, {})

              return cookies
            }
          },
          get getRouter() {
            const isUri = (url) => {
              return /^http[s]?:\/\/([\w\-\.]+)+[\w-]*([\w\-\.\/\?%&=]+)?$/gi.test(
                url
              )
            }
            return () => ({
              reload: () => location.reload(),
              redirect: ({ url }) => location.replace(url),
              back: () => history.back(),
              forward: () => history.forward(),
              pushState: ({ state, title, url }) => {
                if (isUri(url)) {
                  //兼容uri
                  location.href = url
                } else {
                  history.pushState(state, title, url)
                }
              },
              openTab: ({ url, title }) => open(url, title || '_blank'),
            })
          },
        }
      },
      get hasPermission() {
        return ({ permission, key }) => {
          if (!json?.hasPermissionFn) {
            return true
          }

          const code = permission?.register?.code || key

          let result

          try {
            result = runJs(decodeURIComponent(json?.hasPermissionFn), [
              { key: code },
            ])

            if (typeof result !== 'boolean') {
              result = true
              console.warn(
                `权限方法返回值类型应为 Boolean 请检查，[key] ${code}; [返回值] type: ${typeof result}; value: ${JSON.stringify(
                  result
                )}`
              )
            }
          } catch (error) {
            result = true
            console.error(`权限方法出错 [key] ${code}；`, error)
          }

          return result
        }
      },
    },
  })
}

const shapeUrlByEnv = (envList, env, url, mybricksHost) => {
  if (!envList || !env || /^(https?|ws)/.test(url)) return url
  if (env === USE_CUSTOM_HOST) {
    return combineHostAndPath(mybricksHost.default, url)
  }
  const data = (envList || []).find((item) => item.name === env)
  if (!data || !data.value) return url
  return data.value + url
}

const combineHostAndPath = (host, path) => {
  const _host = host.replace(/\/$/, '')
  const _path = path.replace(/^\//, '')
  return _host + '/' + _path
}

const isEqual = (param1, param2) => {
  return param1 === param2
}
