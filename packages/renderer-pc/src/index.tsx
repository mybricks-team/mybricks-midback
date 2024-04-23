import React, {
  useRef,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react'
// import ReactDOM from 'react-dom'
import * as PcLibs from '@mybricks/comlib-pc-normal'
import * as BasicLibs from '@mybricks/comlib-basic'
import { render as renderUI } from '@mybricks/render-web'
import { parseQuery } from './utils'
import { runJs } from '@mybricks/com-utils'

const libraryNameMap = {
  '@mybricks/comlib-pc-normal': PcLibs,
  '@mybricks/comlib-basic': BasicLibs,
}

interface RendererProps {
  json: any
  config: {
    envList
    executeEnv
    locale
    i18nLangContent
  }
  comDefs: any
  props: any
}

const USE_CUSTOM_HOST = '__USE_CUSTOM_HOST__'

export default forwardRef((props: RendererProps, ref: any) => {
  const currentRef = useRef<any>({})
  const { json, config, comDefs, props: comProps = {} } = props
  const { envList, executeEnv, locale, i18nLangContent } = config
  const currentLocale = locale || navigator.language

  const { render, inputs, refs, refsPromise } = useMemo(() => {
    /** 多场景，默认取第一个场景信息 */
    const { inputs, outputs, pinRels } = json.scenes?.[0] || {}
    /** 组件props入参 */
    const relInputs = []
    /** 组件ref透出api */
    const refs = []
    /** 组件ref透出api => promise */
    const refsPromise = []
    /** 被关联的输出项，不作为输出项处理 */
    const relsOutputIdMap = {}

    console.log('pinRels: ', pinRels)

    inputs?.forEach(({ id, type }) => {
      if (type === 'config') {
        relInputs.push(id)
      } else {
        const rels = pinRels[`_rootFrame_-${id}`]
        if (rels) {
          const outputId = rels[0]
          refsPromise.push({ inputId: id, outputId })
          relsOutputIdMap[outputId]
        } else {
          refs.push(id)
        }
      }
    })

    const curComDefs = {}
    Object.keys(comDefs).forEach((key) => {
      const item = comDefs[key]

      curComDefs[key] = {
        runtime: libraryNameMap[item.libraryName][item.runtimeName],
      }
    })

    return {
      inputs: relInputs,
      refs,
      refsPromise,
      render: renderUI(json, {
        comDefs: curComDefs,
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
              window[connector.connectorName] ||
              window['@mybricks/plugins/service']
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
        ref(refs) {
          currentRef.current.refs = refs

          /** 注册事件 */
          outputs?.forEach(({ id }) => {
            /** 注册事件，默认为空函数，并且为非被关联输出项 */
            if (!relsOutputIdMap[id]) {
              refs.outputs(id, comProps[id] || function () {})
            }
          })
        },
        /** 禁止主动触发IO、执行自执行计算组件 */
        disableAutoRun: true,
      }),
    }
  }, [])

  useImperativeHandle(
    ref,
    () => {
      const { current } = currentRef
      const res = {}

      refs.reduce((p, c) => {
        p[c] = current.refs.inputs[c]
        return p
      }, res)

      refsPromise.reduce((p, c) => {
        const { inputId, outputId } = c
        p[inputId] = (value) => {
          return new Promise((resolve) => {
            current.refs.outputs(outputId, resolve)
            current.refs.inputs[inputId](value)
          })
        }
        return p
      }, res)

      return res
    },
    []
  )

  useEffect(() => {
    const { props, refs } = currentRef.current
    /** 对比入参是否变更 */
    if (!props) {
      currentRef.current.props = {...comProps}
      inputs.forEach((id) => {
        refs.inputs[id](comProps[id])
      })
    } else {
      inputs.forEach((id) => {
        if (props[id] !== comProps[id]) {
          props[id] = comProps[id]
          refs.inputs[id](comProps[id])
        }
      })
    }
  }, [comProps])

  return render
})

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
