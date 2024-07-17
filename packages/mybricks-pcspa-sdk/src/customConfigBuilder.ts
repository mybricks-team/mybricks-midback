// 合并暴露给用户的自定义参数
import { SdkContext, IConfig } from './types'

export const createCustomDebugConfigBuilder = (params) => (ctx: SdkContext, config: IConfig) => {
  const { useLocalResources, editorItems, envExtra, plugins, shortcuts, type, pageMetaLoader, pageContentLoader, scenes } = params

  if (useLocalResources?.editorOptions) {
    config.editViewItems.editorOptions = useLocalResources?.editorOptions
  }
  if (useLocalResources?.themeCss) {
    config.geoView.theme.css = useLocalResources?.themeCss
  }
  if (typeof plugins === 'function') {
    const newPlugins = plugins(config.plugins)
    if (!Array.isArray(newPlugins)) {
      throw new Error(`custom plugins should return plugin array`)
    }
    config.plugins = newPlugins
  }

  if (typeof editorItems === 'function') {
    config.editViewItems = editorItems(config.editViewItems)
  }

  if (shortcuts) {
    config.shortcuts = shortcuts
  }

  if (type) {
    config.type = type
  }

  if (typeof pageMetaLoader === 'function') {
    config.pageMetaLoader = pageMetaLoader
  }

  if (typeof pageContentLoader === 'function') {
    config.pageContentLoader = pageContentLoader
  }

  if (scenes) {
    config.scenes = scenes
  }

  config.com.env = {
    ...config.com.env,
    ...envExtra
  }
}