// 合并暴露给用户的自定义参数
import { SdkContext, IConfig } from './types'

export const createCustomDebugConfigBuilder = ({ useLocalResources, editorItems, envExtra, plugins }) => (ctx: SdkContext, config: IConfig) => {
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

    config.com.env = {
        ...config.com.env,
        ...envExtra
    }
}