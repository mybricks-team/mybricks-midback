import React from 'react'
import ReactDOM from 'react-dom'
import * as MUI from '@m-ui/react'
import * as MUIIcon from '@m-ui/icons'
import * as Lodash from 'lodash'
import * as ESProComponents from '@es/pro-components'
import * as ESProComponentsFields from '@es/pro-components-fields'


export const RenderComCDN = 'https://cdnfile.corp.kuaishou.com/kc/files/a/kael-mui-demo/chrome-plugin-upload/2024-10-14/1728909669116.6214e6ea4c70b930.js'
export const CDN2 = 'https://cdnfile.corp.kuaishou.com/kc/files/a/kael-mui-demo/chrome-plugin-upload/2024-10-11/1728640635286.571782d4b1a78fb9.js'
export const CDN3=  'https://cdnfile.corp.kuaishou.com/kc/files/a/kael-mui-demo/chrome-plugin-upload/2024-10-11/1728633434866.02c0df43cec737be.js'


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
  // {
  //   value: moment,
  //   type: 'cjs',
  //   exportName: 'moment',
  // },
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
]
