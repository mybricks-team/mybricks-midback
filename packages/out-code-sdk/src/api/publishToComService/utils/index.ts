import { ComlibAllowMap, GetMaterialContent, Schema, ToJSON } from "../types";
import { getGlobalLogger } from './global-logger';

// 获取指定组件库内的组件信息
export async function getComlibContent(
  comlib: { namespace: string; version: string },
  comlibAllowMap: ComlibAllowMap,
  getMaterialContent: GetMaterialContent,
): Promise<string[]> {
  const Logger = getGlobalLogger();

  // 排除不支持的组件库
  if (!comlibAllowMap[comlib.namespace]) {
    Logger.error(
      `can not find node module for comlib ${comlib.namespace}@${comlib.version}`,
    );
    return [];
  }
  const res = await getMaterialContent({
    namespace: comlib.namespace,
    version: comlib.version,
  })
    .then((data) => {
      const deps = data.react.deps;
      return deps.map((item: any) => item.namespace);
    })
    .catch((err) => {
      Logger.error(`getComlibContent fail 获取 ${comlib.namespace}@${comlib.version} 失败`);
      return undefined;
    });
  return res;
};

function convertToUnderscore(str: string) {
  return str.replace(/[^a-zA-Z0-9]/g, '_');
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getComponentName({
  namespace,
  rtType,
}: {
  namespace: string;
  rtType: string;
}) {
  const lastIndex = namespace.lastIndexOf('.');
  return convertToUnderscore(
    lastIndex !== -1 ? namespace.substring(lastIndex + 1) : namespace,
  )
    .split('_')
    .filter((str) => str)
    .reduce((p, c, index) => {
      return (
        p +
        (rtType?.match(/^js/gi)
          ? index
            ? capitalizeFirstLetter(c)
            : c
          : capitalizeFirstLetter(c))
      );
    }, '');
}

export function collectModuleCom(coms: any, comlibDeps: any[], comlibAllowMap: Record<string, string>) {
  const res = {} as Record<string, any>;
  const newComDefs: any = [];

  coms.forEach((com: any) => {
    const comlib = comlibDeps.find((comlib) =>
      comlib.deps.some((dep: any) => dep === com.namespace),
    );
    if (!comlib) {
      throw new Error(`can not find comlib module for com ${com.namespace}`);
    }
    const module = comlibAllowMap[comlib.namespace];
    if (!res[module]) {
      res[module] = [];
    }
    const componentName = getComponentName({
      namespace: com.namespace,
      rtType: com.rtType,
    });

    res[module].push(componentName);

    newComDefs.push({
      ...com,
      namespace: com.namespace,
      runtimeName: componentName,
      libraryName: module,
    });
  });

  return {
    importInfo: res,
    newComDefs,
  };
};


export function transSchemaToTS(schema: Schema) {
  let typeStr = '';

  switch (schema?.type) {
    case 'string':
    case 'number':
    case 'any':
    case 'boolean':
      typeStr = schema.type
      break;

    case 'array':
      typeStr = `${transSchemaToTS(schema.items)}[]`
      break;

    case 'object':
    case 'indexObject':
      if (schema.properties) {
        typeStr = `{ ${Object.entries(schema.properties)
          .map(([key, val]) => `${key}: ${transSchemaToTS(val)}; `)
          .join('')} }`
      } else { typeStr = '{}'; }

      break;

    case 'enum':
      typeStr = schema.items.map(item => {
        return item.type === 'string' ? `"${item.value}"` : Number(item.value);
      }).join(' | ');
      break;

    case 'tuple':
      typeStr = `[ ${schema.items.map(item => transSchemaToTS(item)).join(', ')} ]`
      break;

    default:
      typeStr = 'any'
  }

  return typeStr;
}

export function transSchemaToVueProp(schema: Schema, defaultValue?: string) {
  let res = 'type:'
  const toVueObjectType = (str: string, type: string = 'Object') => `${type} as PropType<${str}>`

  switch (schema?.type) {
    case 'string':
      res += 'String'
      break;
    case 'number':
      res += 'Number'
      break;
    case 'any':
      res += 'null'
      break;
    case 'boolean':
      res += 'Boolean'
      break;

    case 'array':
      res += toVueObjectType(`${transSchemaToTS(schema.items)}[]`, 'Array')
      break;

    case 'object':
    case 'indexObject':
      if (schema.properties) {
        res += toVueObjectType(`{ ${Object.entries(schema.properties)
          .map(([key, val]) => `${key}: ${transSchemaToTS(val)}; `)
          .join('')} }`)
      } else { res += toVueObjectType('{}'); }
      break;

    case 'enum':
      res += toVueObjectType(schema.items.map(item => {
        return item.type === 'string' ? `"${item.value}"` : Number(item.value);
      }).join(' | '));
      break;

    case 'tuple':
      res += toVueObjectType(`[ ${schema.items.map(item => transSchemaToTS(item)).join(', ')} ]`)
      break;

    default:
      res += 'null';
  }

  if (defaultValue) {
    res += `, default: () => (${defaultValue})`;
  }

  return `{${res}}`;
}

function analysisConfigInputsTS(json: ToJSON) {
  const Logger = getGlobalLogger();
  Logger.info(`[publishToCom] 开始解析 configInputs 的类型...`);
  const { inputs } = json.scenes?.[0] || json;

  const configInputs = inputs.filter(item => item?.type === 'config');

  const configInputsTS = configInputs.map(input => {
    const { id, schema } = input;
    return `${id}?: ${transSchemaToTS(schema)}; `;
  }).join('');

  Logger.info(`[publishToCom] 解析 configInputs 的类型完成`);
  return configInputsTS;
}

function analysisNormalInputsTS(json: ToJSON) {
  const Logger = getGlobalLogger();
  Logger.info(`[publishToCom] 开始解析 normalInputs 的类型...`);
  const { inputs, outputs, pinRels } = json.scenes?.[0] || json;

  const normalInputs = inputs.filter(item => item?.type === 'normal');

  const normalInputsTS = normalInputs.map(input => {
    const { id, schema } = input;
    let result = 'void';

    const rels = pinRels[`_rootFrame_-${id}`]
    // 有关联输出项时，input 的返回值是 Promise<关联输出项的类型>
    if (rels?.length) {
      const resultSchema = outputs.find(output => output.id === rels[0])!.schema;
      result = `Promise<${transSchemaToTS(resultSchema)}>`;
    }

    return `${id}: (value: ${transSchemaToTS(schema)}) => ${result}; `;
  }).join('');

  Logger.info(`[publishToCom] 解析 normalInputs 的类型完成`);
  return normalInputsTS;
}

function analysisOutputsTS(json: ToJSON) {
  const Logger = getGlobalLogger();
  Logger.info(`[publishToCom] 开始解析 outputs 的类型...`);
  const { outputs, pinRels } = json.scenes?.[0] || json;

  const pinRelsMap = Object.entries(pinRels).reduce((acc, [key, val]) => {
    val.forEach((cur) => acc.set(cur, key));
    return acc;
  }, new Map())
  // 如果是某个 input 的关联输出项，则忽略
  const withoutRefOutput = outputs.filter(item => !pinRelsMap.get(item.id));

  const outputsTs = withoutRefOutput.map((output) => {
    const { id, schema } = output;
    return `${id}?: (value: ${transSchemaToTS(schema)}) => void; `;
  }).join('');

  Logger.info(`[publishToCom] 解析 outputs 的类型完成`);
  return outputsTs;
}

function analysisReactDefaultProps(json: ToJSON) {
  const { inputs } = json.scenes?.[0] || json;
  let res = '';
  inputs.forEach(item => {
    if (item.type !== 'config') return;
    const key = item.id;
    const value = item.extValues?.config?.defaultValue;
    if (value) res += `${key}:${value},`;
  })
  return res;
}

export { analysisConfigInputsTS, analysisNormalInputsTS, analysisOutputsTS, analysisReactDefaultProps };

export function camelToKebab(camelCaseString: string) {
  return camelCaseString.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function hasRequiredProperties(obj: Record<string, any>, requiredProperties: string[]): boolean {
  const missingProperties = requiredProperties.filter(prop => obj[prop] === undefined);

  if (missingProperties.length > 0) {
    console.log(`缺少属性: ${missingProperties.join(', ')}`);
    return false;
  }

  return true;
}