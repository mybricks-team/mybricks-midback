import { IParams } from "..";
import { ComlibAllowMap } from "../types";
import { analysisConfigInputsTS, analysisNormalInputsTS, analysisOutputsTS, analysisReactDefaultProps, camelToKebab } from "../utils";
import { extractCodeFn } from "../utils/extractCodeFn";
import processComRelativeSymbols from "./process-com-relative-symbols";
import { processImageSymbols } from "./process-image-symbols";

export interface ISymbolValue {
  symbol: string;
  value: string;
}

export async function processData(params: IParams) {
  const { json, hostname, fileId, componentName, envType, uploadCDNUrl, staticResourceToCDN, origin, getMaterialContent } = params;
  const { envList = [], i18nLangContent } = json.configuration;

  const sourceLink = (() => {
    if (process.env.NODE_ENV === 'development') { return `${hostname}/?id=${fileId}`; }
    return `${hostname}/mybricks-app-pc-cdm/index.html?id=${fileId}`;
  })();

  const { transformJson, extractFns } = extractCodeFn(json);
  const comlibAllowMap = (params.allowComlibs || [])?.reduce((pre, cur) => {
    pre[cur.namespace] = cur.packageName;
    return pre;
  }, {
    'mybricks.normal-pc': '@mybricks/comlib-pc-normal',
    'mybricks.basic-comlib': '@mybricks/comlib-basic',
  } as ComlibAllowMap);

  const comRelativeSymbols = await processComRelativeSymbols({ json: transformJson, comLibs: json.configuration.comLibs, fileId, comlibAllowMap, getMaterialContent: getMaterialContent });

  const { symbols: imageSymbols, staticResources } = await processImageSymbols(json, origin, staticResourceToCDN, uploadCDNUrl);

  return {
    symbols: [
      { symbol: 'json', value: JSON.stringify(transformJson) },
      { symbol: 'executeEnv', value: JSON.stringify(envType) },
      { symbol: 'i18nLangContent', value: JSON.stringify(i18nLangContent) },
      { symbol: 'envList', value: JSON.stringify(envList) },
      { symbol: 'sourceLink', value: sourceLink },
      { symbol: 'componentName', value: componentName || 'Com' },
      { symbol: 'componentKebabName', value: camelToKebab(componentName || 'Com') },
      { symbol: 'extractFns', value: extractFns },
      { symbol: 'propsType', value: analysisConfigInputsTS(json) + analysisOutputsTS(json) },
      { symbol: 'defaultProps', value: analysisReactDefaultProps(json) },
      { symbol: 'refType', value: analysisNormalInputsTS(json) },
      ...comRelativeSymbols,
      ...imageSymbols,
    ],
    staticResources
  }
}