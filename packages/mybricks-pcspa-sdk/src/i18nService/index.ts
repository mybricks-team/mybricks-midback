const i18nEnv = (context, value) => {
  if (typeof value === 'string') return value
  const { pageContent } = context

  const i18nLangContent = pageContent.i18nLangContent || {}

  // 搭建页面使用中文
  return i18nLangContent[value?.id]?.content?.[context.getCurrentLocale()] || JSON.stringify(value)
}

export {
  i18nEnv
}