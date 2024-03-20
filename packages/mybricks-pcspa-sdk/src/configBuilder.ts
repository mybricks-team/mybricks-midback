import { IConfig, IConfigBuilder } from "./types";

export const createConfigBuilder = <T>(...builders: IConfigBuilder<T>[]) => (ctx: T, baseConfig: IConfig) => {
  const newConfig = { ...baseConfig }
  builders.forEach(builder => builder(ctx, newConfig))

  if (newConfig.editViewItems) {
    // 还原成引擎的函数配置
    let editViewItems = newConfig.editViewItems
    newConfig.editView = {
      items({ }, cate0) {
        cate0.title = editViewItems['cate0'].title
        cate0.items = editViewItems['cate0'].items
      },
      editorOptions: editViewItems?.editorOptions
    }
  }

  if (newConfig.plugins) {
    // 还原成引擎的数组配置
    let newPugins = newConfig.plugins
    if (newPugins.some(item => !item.instance)) {
      throw new Error(`[create plugins error]: plugins's instance is empty`)
    }
    newConfig.plugins = newPugins.map(item => item.instance)
  }

  return newConfig
}
