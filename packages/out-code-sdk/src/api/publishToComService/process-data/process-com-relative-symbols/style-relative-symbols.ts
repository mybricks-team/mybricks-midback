import { ToJSON } from "../../types"
import { getStyleInnerHtml } from "@mybricks/render-utils";
import * as prettier from 'prettier';

/** 解析主题插件 */
const getThemesInnerHtml = (toJSON: ToJSON) => {
  let innerHTML = '';
  const themes = toJSON.plugins?.['@mybricks/plugins/theme/use']?.themes
  if (Array.isArray(themes)) {
    themes.forEach(({ content }) => {
      const variables = content?.variables

      if (Array.isArray(variables)) {
        let rootHTML = ''

        variables.forEach(({ configs }) => {
          if (Array.isArray(configs)) {
            configs.forEach(({ key, value }) => {
              rootHTML = rootHTML + `${key}: ${value};\n`
            })
          }
        })

        innerHTML = innerHTML + `:root {\n${rootHTML}}`
      }
    })
    Reflect.deleteProperty(toJSON.plugins, "@mybricks/plugins/theme/use")
  }

  return innerHTML
}
export const processStyleRelativeSymbols = async (fileId: number, transformJson: ToJSON) => {

  const innerHTML = await prettier.format(await getStyleInnerHtml(transformJson), {
    parser: 'css',      // 使用babel-ts解析器，支持TSX格式
    semi: true,         // 在语句末尾添加分号
    singleQuote: true,  // 使用单引号
    tabWidth: 2         // 缩进宽度
  })

  return [
    {
      symbol: 'style', value: `const styleTag = document.createElement('style')
    styleTag.id = "${fileId}";
    styleTag.innerHTML = \`${getThemesInnerHtml(transformJson)}
    ${innerHTML}\`
    document.head.appendChild(styleTag)
    ` },
  ]
}