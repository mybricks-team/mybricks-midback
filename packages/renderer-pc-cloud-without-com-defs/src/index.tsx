import React, { forwardRef, useMemo } from 'react'
import * as ComlibPCNormal from '@mybricks/comlib-pc-normal/es';
import * as ComlibBasic from '@mybricks/comlib-basic/es'
import * as ComlibPCAi from '@mybricks/comlib-ai-pc';
import Core from './core'
import zhCN from "antd/lib/locale/zh_CN"
import { ConfigProvider } from "antd"

window.React = React;

interface IProps {
  toJSON: any;
  [x: string]: any
}

const RendererCloud = forwardRef(
  ({ comUrl, toJSON, ...comProps }: IProps, ref: any) => {
    const comDefs = useMemo(() => {
      return Object.values(ComlibPCNormal).concat(Object.values(ComlibBasic)).concat(Object.values(ComlibPCAi)).reduce((acc, cur) => {
        acc[cur.namespace] = cur
        const split = cur.namespace.split(".");
        split.splice(split.length - 1, 0, "antd5");
        acc[split.join(".")] = cur
        return acc
      }, {})
    }, [])

    return (
      <ConfigProvider locale={zhCN}>
        <Core
          ref={ref}
          json={toJSON}
          comDefs={comDefs}
          props={comProps}
          onLoaded={() => { comProps.onLoaded?.(ref); }}
        />
      </ConfigProvider>
    )
  }
)

export default RendererCloud
