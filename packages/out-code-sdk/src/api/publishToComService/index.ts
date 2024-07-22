import { setGlobalLogger, getGlobalLogger } from './utils/global-logger';
import type { LoggerType } from './utils/global-logger';
import { GetMaterialContent, ToJSON } from './types';
import { processData } from './process-data';
import { hasRequiredProperties } from './utils';

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
  const Logger = getGlobalLogger();
  const { json } = params;

  if (!hasRequiredProperties(params, ['json', 'fileId', 'componentName', 'envType', 'hostname', 'origin', 'staticResourceToCDN', 'getMaterialContent'])) {
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

export default async function replaceTemplate(
  params: IParams,
  templateArray: string[],
  options?: { Logger?: LoggerType }
) {
  setGlobalLogger(options?.Logger || { info: console.log, error: console.error });

  checkParams(params);

  const { symbols, staticResources } = await processData(params);

  const codes = templateArray.map((template) => {
    symbols.forEach((symbolValue) => {
      const { symbol, value } = symbolValue;
      template = template.replace(new RegExp(`--${symbol}--`, 'g'), value);
    })
    return template;
  })

  return { codes, staticResources }
}