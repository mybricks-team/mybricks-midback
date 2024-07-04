import React, { forwardRef, useLayoutEffect, useRef, useState } from 'react'
import { Spin, Alert } from 'antd'
import Core from './core'

import loadScript from './utils/loadScript'

interface IProps {
  comUrl: string
  [x: string]: any
}

const MY_BRICKS_CLOUD = '__MY_BRICKS_CLOUD__'

const RendererCloud = forwardRef(
  ({ comUrl, ...comProps }: IProps, ref: any) => {
    const comMeta = useRef<{ fileId; version }>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useLayoutEffect(() => {
      comMeta.current = getComMetaForUrl(comUrl)

      const comKey = `${comMeta.current.fileId}@${comMeta.current.version}`

      if (window[MY_BRICKS_CLOUD]?.[comKey]) {
        setLoading(false)
      } else {
        loadScript(comUrl, {
          success: () => {
            setLoading(false)
          },
          failed: (msg) => {
            setError(msg)
            setLoading(false)
          },
        })
      }
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
