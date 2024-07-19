import * as fs from "fs";
import * as path from "path";
import { camelToKebab } from "./utils";
import { transSchemaToVueProp } from "./utils";
import { Schema, ToJSON } from "./types";

const getTsTypeForSchema = (schema: Schema, mode?: 'propsType' | 'tsType') => {
  if (!schema) {
    return 'any'
  }
  const { type } = schema
  let result = ''

  if (mode === 'propsType') {
    if (type === 'string') {
      result = 'String'
    } else if (type === 'boolean') {
      result = 'Boolean'
    } else if (type === 'object') {
      result = ``
    } else {
      result = 'any'
    }
  } else {
    if (type === 'string') {
      result = 'string'
    } else if (schema.type === 'object') {
      result = `{ ${Object.entries(schema.properties!)
        .map(([key, val]) => `${key}: ${getTsTypeForSchema(val, mode)}; `)
        .join('')} }`
    } else if (type === 'array') {
      result = `${getTsTypeForSchema(schema.items, mode)}[]`
    } else if (type === 'enum') {
      result = schema.items.map(item => {
        return item?.type === 'string' ? `"${item.value}"` : Number(item.value);
      }).join(' | ')
    } else if (type === 'tuple') {
      result = `[ ${schema.items.map(item => getTsTypeForSchema(item)).join(', ')} ]`
    }
    else {
      result = 'any'
    }
  }

  return result
}

function genVueDefineProps(json: ToJSON) {
  const { inputs, outputs, pinRels, slot } = json.scenes?.[0] || {}
  const comTypeConfig: Record<string, any> = {}
  const mainStyle = slot!.style
  const curRelOutputIds: string[] = []

  inputs!.forEach((item) => {
    if (item?.type === 'config') {
      comTypeConfig[item.id] = {
        title: item.title,
        propsType: 'props',
        schema: item.schema,
        config: {
          description: item.extValues?.config?.description,
          defaultValue: item.extValues?.config?.defaultValue
        }
      }
    } else {
      const rels = pinRels![`_rootFrame_-${item.id}`]

      if (rels?.length) {
        curRelOutputIds.push(rels[0])
      }

      comTypeConfig[item.id] = {
        title: item.title,
        rels: rels,
        propsType: 'funtionProps',
        schema: item.schema,
      }
    }
  })

  outputs!.forEach((item) => {
    // 过滤已经被关联过的 output
    if (!curRelOutputIds.includes(item.id)) {
      comTypeConfig[item.id] = {
        title: item.title,
        propsType: 'event',
        schema: item.schema,
      }
    }
  })

  let propsArr: string[] = []
  let defineTplProps = ''
  let emitsArr: string[] = []
  let defineExposeArr: string[] = []
  let setupPropsStr = ''
  let methodsStr = ''
  let styleStr = ''
  // let interfaceStr = ''


  Object.keys(comTypeConfig).forEach((key) => {
    const item = comTypeConfig[key]
    if (item.propsType === 'props') {
      propsArr.push(`${key}: ${transSchemaToVueProp(item.schema, item.config.defaultValue)}`);

      defineTplProps += ` ${key},`
    } else if (item.propsType === 'funtionProps') {
      const tsType = getTsTypeForSchema(item.schema)

      defineExposeArr.push(key)

      if (item.rels) {
        methodsStr += `${key} (params: ${tsType}) {
          return this.m_comRef.currentRef.__veauryReactRef__.${key}(params)
        },`+ '\n'
      } else {
        methodsStr += `${key} (params: ${tsType}) {
          this._getRef(params, '${key}', null).then(ref => {
            ref.${key}(params)
          })
        },`+ '\n'
      }
    } else if (item.propsType === 'event') {
      const tsType = getTsTypeForSchema(item.schema)

      emitsArr.push(`${key}: (values: ${tsType}) => { return true },`)

      setupPropsStr += `${key}: (values: ${tsType}) => { ctx.emit('${key}', values) },` + '\n'
    }
  })

  Object.keys(mainStyle).forEach(key => {
    const styleItem = mainStyle[key]
    if (key === 'width') {
      if (mainStyle.widthFull) {
        styleStr += `${key}: 100%;`
      } else {
        styleStr += `${key}: ${styleItem}px;`
      }
    } else if (key === 'height') {
      styleStr += `${key}: ${styleItem}px;`
    }
  })

  return {
    propsArr,
    emitsArr,
    defineExposeArr,
    setupPropsStr,
    methodsStr,
    styleStr,
    defineTplProps
  }

}

function genTemplateForVue(params: any) {
  const {
    json,
    transformJson,
    extractFns,
    envType,
    envList,
    i18nLangContent,
    comImportsStr,
    comDefs,
    sourceLink
  } = params

  const tplFilePath = path.resolve(__dirname, "./templates/com-tpl-for-vue.txt");

  let template = fs.readFileSync(tplFilePath, "utf8");

  const { propsArr, emitsArr, defineExposeArr, setupPropsStr, methodsStr, styleStr, defineTplProps } = genVueDefineProps(json)
  template = template.replace(`--extractFns--`, extractFns)
    .replace(`--json--`, JSON.stringify(transformJson))
    .replace(`'--executeEnv--'`, JSON.stringify(envType))
    .replace(`'--envList--'`, JSON.stringify(envList))
    .replace(`'--i18nLangContent--'`, JSON.stringify(i18nLangContent))
    .replace(`-- components-imports --`, comImportsStr)
    .replace(`--comDefs--`, `{${comDefs}}`)
    .replace(`--url--`, sourceLink)
    .replace(`--props--`, propsArr.map(prop => `${prop},`).join(''))
    .replace(`--defineTplProps--`, defineTplProps)
    .replace(`--emitsArr--`, emitsArr.join('' + '\n'))
    .replace(`--defineExposeArr--`, JSON.stringify(defineExposeArr))
    .replace(`--setupPropsStr--`, setupPropsStr)
    .replace(`--methodsStr--`, methodsStr)
    .replace(`--style--`, styleStr)

  return template
}

function genTemplateForVueIndex({ componentName }: { componentName: string }) {
  const tplFilePath = path.resolve(__dirname, "./templates/com-tpl-for-vue-index.txt");

  let template = fs.readFileSync(tplFilePath, "utf8");

  template = template.replace(/--componentName--/g, componentName);

  return template;
}

function genTemplateForVueReadme({ componentName, sourceLink }: { componentName: string, sourceLink: string }) {
  const tplFilePath = path.resolve(__dirname, "./templates/readme-for-vue.txt");

  let template = fs.readFileSync(tplFilePath, "utf8");

  template = template.replace(/--url--/g, sourceLink)
    .replace(/--componentName--/g, componentName)
    .replace(/--componentKebabName--/g, camelToKebab(componentName));

  return template;
}


export {
  genTemplateForVue,
  genTemplateForVueIndex,
  genTemplateForVueReadme
}