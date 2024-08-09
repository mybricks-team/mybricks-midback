import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Spin, Alert } from 'antd'
import Core from './core'

import loadScript from './utils/loadScript'

interface IProps {
  comUrl: string
  onLoaded?: (ref: any) => void
  [x: string]: any
}

const MY_BRICKS_CLOUD = '__MY_BRICKS_CLOUD__'

const RendererCloud = forwardRef(
  ({ comUrl, ...comProps }: IProps, ref: any) => {
    const comMeta = useRef<{ fileId; version }>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // 添加主题变量样式
    function appendThemeVarsStyle() {
      const THEME_VARS_STYLE = comMeta.current?.fileId + '__themeVarsStyle__';
      if (window[THEME_VARS_STYLE]) {
        const style = document.createElement('style')
        style.setAttribute('data-id', THEME_VARS_STYLE)
        style.innerHTML = window[THEME_VARS_STYLE]
        document.head.appendChild(style)
      }
    }
    // 移除主题变量样式
    function removeThemeVarsStyle() {
      const THEME_VARS_STYLE = comMeta.current?.fileId + '__themeVarsStyle__';
      const style = document.querySelector(`style[data-id="${THEME_VARS_STYLE}"]`)
      if (style) { style.remove() }
    }

    useLayoutEffect(() => {
      comMeta.current = getComMetaForUrl(comUrl)

      const comKey = `${comMeta.current.fileId}@${comMeta.current.version}`

      if (window[MY_BRICKS_CLOUD]?.[comKey]) {
        setLoading(false)
        appendThemeVarsStyle();
      } else {
        loadScript(comUrl, {
          success: () => {
            setLoading(false)
            appendThemeVarsStyle();
          },
          failed: (msg) => {
            setError(msg)
            setLoading(false)
          },
        })
      }

      return () => { removeThemeVarsStyle(); }
    }, [comUrl, loading])

    if (error) {
      return <Alert message={error} type="error" />;
    }

    return loading ? (
      <div style={{
        width: '100%',
        height: '100%'
      }}>
        <Spin spinning={loading} tip="loading..." />
      </div>
    ) : (
      <Core
        ref={ref}
        json={
          window[MY_BRICKS_CLOUD][
            `${comMeta.current.fileId}@${comMeta.current.version}`
          ].toJSON
        }
        comDefs={
          window[MY_BRICKS_CLOUD][
            `${comMeta.current.fileId}@${comMeta.current.version}`
          ].comDefs
        }
        props={comProps}
        onLoaded={() => { comProps.onLoaded?.(ref); }}
      />
    )
  }
)

export default RendererCloud

/**
 * @description 根据 URL 解析 fileId 与 version
 */
const getComMetaForUrl = (comUrl: string) => {
  const fileName = comUrl.split('/').pop()
  const idMatch = fileName.match(/\d+/)
  const fileId = idMatch ? idMatch[0] : null

  const versionMatch = fileName.match(/-(\d+\.\d+\.\d+)(?=\.js)/)
  const version = versionMatch ? versionMatch[1] : null
  return {
    fileId,
    version,
  }
}
