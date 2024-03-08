import { IConfigBuilder, SdkContext } from "../types"
import localePlugin from '@mybricks/plugin-locale'

export const configI18n: IConfigBuilder<SdkContext> = (context, config) => {
  const { pageContent } = context
  // 添加env变量
  config.com.env = {
    ...config.com.env,
    get i18n() {
      return createI18nEnv(context)
    }
  }

  // 添加var变量
  config.com.env.vars = {
    ...config.com.env.vars,
    get i18nLangContent() {
      return pageContent.i18nLangContent || {}
    },
    get locale() {
      return context.getCurrentLocale()
    }
  }

  // 添加插件
  config.plugins.push({
    name: 'locale',
    instance: localePlugin({
      onPackLoad: ({ i18nLangContent }) => {
        pageContent.i18nLangContent = i18nLangContent
      },
      onUsedIdChanged: ({ ids }) => {
        pageContent.i18nUsedIdList = ids
      }
    }),
  })
}

const createI18nEnv = (context) => value => {
  if (typeof value === 'string') return value
  const { pageContent } = context

  const i18nLangContent = pageContent.i18nLangContent || {}

  // 搭建页面使用中文
  return i18nLangContent[value?.id]?.content?.[context.getCurrentLocale()] || JSON.stringify(value)
}
