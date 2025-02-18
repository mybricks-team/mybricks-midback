import React, { forwardRef, useMemo } from 'react'
import * as ComlibPCNormal from '@mybricks/comlib-pc-normal/es';
import * as ComlibBasic from '@mybricks/comlib-basic/es'
import Core from './core'

interface IProps {
  toJSON: any;
  [x: string]: any
}

const RendererCloud = forwardRef(
  ({ comUrl, toJSON, ...comProps }: IProps, ref: any) => {
    const comDefs = useMemo(() => {
      return Object.values(ComlibPCNormal).concat(Object.values(ComlibBasic)).reduce((acc, cur) => {
        acc[cur.namespace] = cur
        const split = cur.namespace.split(".");
        split.splice(split.length - 1, 0, "antd5");
        acc[split.join(".")] = cur
        return acc
      }, {})
    }, [])

    return <Core
      ref={ref}
      json={toJSON}
      comDefs={comDefs}
      props={comProps}
      onLoaded={() => { comProps.onLoaded?.(ref); }}
    />;
  }
)

export default RendererCloud
