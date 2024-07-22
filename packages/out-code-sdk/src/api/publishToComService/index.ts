import Logger from './utils/logger';
import { GetMaterialContent, ToJSON } from './types';
import { processData } from './process-data';

export interface IParams {
  json: ToJSON & { configuration: any };
  fileId: number;
  componentName: string;
  envType: string;
  hostname: string;
  toLocalType: string;
  origin: string;
  staticResourceToCDN: boolean;
  uploadCDNUrl?: string;
  getMaterialContent: GetMaterialContent;
}

/**
 * 检查入参的正确性
 * @param params 入参
 */
function checkParams(params: IParams) {
  const {
    json,
    fileId,
    componentName,
    envType,
    hostname,
    origin,
    staticResourceToCDN,
    uploadCDNUrl,
    getMaterialContent,
  } = params;

  Logger.info(
    `[publishToCom] 入参为: ${JSON.stringify({ fileId, componentName, envType, hostname, origin, staticResourceToCDN, uploadCDNUrl })}`,
  );

  if (!json || !fileId || !componentName || !envType || !hostname || !origin || !staticResourceToCDN || !getMaterialContent) {
    Logger.error('[publishToCom] 入参不完整');
    throw new Error('入参不完整');
  }

  const scene = json.scenes?.[0] || json;
  if (
    scene.inputs.length !== new Set(scene.inputs.map((item) => item.id)).size
  ) {
    throw new Error('输入项id重复');
  }
  if (
    scene.outputs.length !== new Set(scene.outputs.map((item) => item.id)).size
  ) {
    throw new Error('输出项id重复');
  }

  return true;
}

export default async function replaceTemplate(params: IParams, templateArray: string[]) {
  checkParams(params);

  const symbolValues = await processData(params);

  console.log(`symbolValues JD==> `, symbolValues);

  return templateArray.map((template) => {
    symbolValues.forEach((symbolValue) => {
      const { symbol, value } = symbolValue;
      template = template.replace(new RegExp(`--${symbol}--`, 'g'), value);
    })
    return template;
  })
}