import { type MaterialServerConfig, ComLibType } from '@mybricks/mybricks-material-loader'
export interface PageContent {
  fileName?: string
  absoluteNamePath?: string
  hasPermissionFn?: string
  pageSchema: Record<string, any>
  isDebugPermissionEnabled?: boolean
  directConnection: boolean
  executeEnv: string
  MYBRICKS_HOST: Record<string, string>
  envList: { title: string, name: string; value: string }[]
  debugMockConfig: {
    debugQuery: any,
    debugProps: any,
    localStorageMock: any,
    debugHeaders: any,
    sessionStorageMock: any,
  },
  i18nLangContent: any,
  i18nUsedIdList: any,
  comlibs?: string[]
  [key: string]: any
}
export enum EnumMode {
  DEFAULT,
  ENV,
  CUSTOM
}

type Material = {
  comLibs: Array<ComLibType>,
  config: MaterialServerConfig
}

export interface SdkContext {
  pageContent: PageContent
  designerRef?: any
  getCurrentLocale: () => string,
  material: Material
}

export interface PcSpaDesignerProps {
  useLocalResources?: {
    editorOptions?: any
    themeCss?: string[]
  }
  editorItems?: (items: any) => any
  plugins?: (plugins: IPlugin[]) => IPlugin[]
  pageContent?: PageContent
  envExtra?: Record<string, any>
  /* 快捷键 */
  shortcuts?: Record<string, any[]>
  /** 页面类型 mpa */
  type?: string
  /** 分页模式 */
  pageMetaLoader?: () => any
  // ... toplView events
  material: Material
}

export interface TEditViewItems {
  cate0: {
    title: string,
    items: TeditItem[]
  },
  editorOptions?: any
}

interface TeditItem {
  title?: string
  items?: TeditItem[]
  type?: string
  description?: string
  options?: any
  value?: {
    get: Function,
    set?: Function
  }
}

export interface IConfig {
  shortcuts: any
  plugins: Array<IPlugin>
  editViewItems: TEditViewItems
  com: {
    env: {
      vars: any
      [key: string]: any
    }
    [key: string]: any
  }
  geoView: {
    scenes: any,
    theme: {
      css?: any,
    }
  }
  [key: string]: any
}


export interface IPlugin {
  name: string,
  instance: any
}

export interface IConfigBuilder<T> {
  (context: T, config: IConfig): void
}