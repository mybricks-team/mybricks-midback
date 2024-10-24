import React from 'react'
import ReactDOM from 'react-dom'
import * as MUI from '@m-ui/react'
import * as MUIIcon from '@m-ui/icons'
import * as Lodash from 'lodash'
import * as ESProComponents from '@es/pro-components'
import * as ESProComponentsFields from '@es/pro-components-fields'
import  moment from 'moment'
import * as EshopRequest from '@es/request/pc';
// import * as  ReactRenderer from '@Lingzhu'
export const RenderComCDN = 'https://cdnfile.corp.kuaishou.com/kc/files/a/kael-mui-demo/chrome-plugin-upload/2024-10-14/1728909669116.6214e6ea4c70b930.js'
export const CDN2 = 'https://cdnfile.corp.kuaishou.com/kc/files/a/kael-mui-demo/chrome-plugin-upload/2024-10-11/1728640635286.571782d4b1a78fb9.js'
export const CDN3=  'https://cdnfile.corp.kuaishou.com/kc/files/a/kael-mui-demo/chrome-plugin-upload/2024-10-11/1728633434866.02c0df43cec737be.js'


const DemoUrl = 'https://w1.beckwai.com/kos/nlav12333/cdm-thumbnai/Button_Wed0.34476.js'

// 搭建地址 https://lingzhu.staging.kuaishou.com/sketch/lowCode/designer/?appKey=yzj_letter_com_group&outAppKey=letter_com_group&tenant=yzj&orderId=2428901041503&resourceCode=local_btn_1&use-declare=1
const DemoUrl2 = 'https://w1.beckwai.com/kos/nlav12333/cdm-thumbnai/local_btn0.49611.js'

const demo3 = 'https://cdnfile.corp.kuaishou.com/kc/files/a/kael-mui-demo/chrome-plugin-upload/2024-10-15/1728995191592.102ca58d6b6a91ec.js'

export const urls = [
  'https://unpkg.com/react-draggable@4.4.4/build/web/react-draggable.min.js',
  // RenderCom 
  'https://cdnfile.corp.kuaishou.com/kc/files/a/kael-mui-demo/chrome-plugin-upload/2024-10-14/1728909669116.6214e6ea4c70b930.js',
  // Vite Demo
  'https://cdnfile.corp.kuaishou.com/kc/files/a/kael-mui-demo/chrome-plugin-upload/2024-10-13/1728799903328.9c86c9cafa0fbd61.js',
  'https://cdnfile.corp.kuaishou.com/kc/files/a/kael-mui-demo/chrome-plugin-upload/2024-10-11/1728625605777.45ba73bd31ac5db9.js',
  // button
  'https://cdnfile.corp.kuaishou.com/kc/files/a/kael-mui-demo/chrome-plugin-upload/2024-10-14/1728914111742.253c11471b90d5b1.js',
]

const  MATERIAL_TYPE_SEPARATOR = '::'
export function encodeComponentType(
  libName: string,
  materialName: string,
  libVersion?: string,
): string {
  if (libVersion) {
    return `${libName}${MATERIAL_TYPE_SEPARATOR}${materialName}${MATERIAL_TYPE_SEPARATOR}${libVersion}`
  }
  return `${libName}${MATERIAL_TYPE_SEPARATOR}${materialName}`
}


export function getLocalDeps (deps, depsCacheInstance) {
  const localDeps: Record<string, any> = {}
  const depsCacheMap: Record<string, any> = {}
  const libs: any[] = []
  for (const key in deps) {
    const { exportName, type, version } = deps[key] as Required<any>
    const cacheKey = encodeComponentType(exportName, version || '')

    if (!depsCacheMap[cacheKey]) {
      const value = (deps[key] as any)['value']
      const urls = (deps[key] as any)['urls']

      if (value) {
        localDeps[exportName] = value
        if (type === 'global') {
          window[exportName as any] = value
        }

        depsCacheMap[exportName] = true
        // depsCacheInstance[exportName] = value

        if (version) {
          depsCacheMap[cacheKey] = true
        }
      } else if (urls?.length) {
        if (depsCacheInstance[exportName]) {
          localDeps[exportName] = depsCacheInstance[exportName]
        } else {
          libs.push(deps[key] as any)
        }
      }
    }
  }
  return  localDeps
}
export const deps = [
  {
    exportName: 'react',
    value: React,
    type: 'cjs',
  },
  {
    exportName: 'react-dom',
    value: ReactDOM,
    type: 'cjs',
  },
  {
    value: React,
    type: 'cjs',
    exportName: 'React',
  },
  {
    value: ReactDOM,
    type: 'cjs',
    exportName: 'ReactDom',
  },
  {
    exportName: 'lodash',
    value: Lodash,
    type: 'cjs',
  },
  {
    exportName: 'lodash-es',
    value: Lodash,
    type: 'cjs',
  },
  {
    value: moment,
    type: 'cjs',
    exportName: 'moment',
  },
  {
    value: MUI,
    type: 'cjs',
    exportName: '@m-ui/react',
  },
  {
    value: MUIIcon,
    type: 'cjs',
    exportName: '@m-ui/icons',
  },
  {
    value: ESProComponents,
    type: 'cjs',
    exportName: '@es/pro-components',
  },
  {
    value: ESProComponentsFields,
    type: 'cjs',
    exportName: '@es/pro-components-fields',
  },
  {
    value: EshopRequest,
    type: 'cjs',
    exportName: '@es/request/pc',
  },
  // {
  //   exportName: '@lingzhu-cdm-app/renderer',
  //   value: ReactRenderer,
  //   type: 'cjs'
  // },
]
