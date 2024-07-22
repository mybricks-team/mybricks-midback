import Logger from '../utils/logger';
import { transformCodeByBabel } from './transform';

const NeedTransformCom = [
  'fangzhou.normal-pc.code.segment',
  'mybricks.normal-pc.segment',
  'mybricks.basic-comlib._muilt-inputJs',
  'mybricks.normal-pc.muilt-inputJs',
];

const NeedTransformPlugin = [
  '@mybricks/plugins/service',
  '@manatee/service-interface',
];

const safeDecoder = (code: string) => {
  try {
    return decodeURIComponent(code);
  } catch (error) {
    return code;
  }
};

let extractFns: string[] = [];

const doExtractFn = (code: string, tip?: string) => {
  try {
    const len = extractFns.length;
    extractFns.push(`// ${tip}
${safeDecoder(code)}`);
    return len;
  } catch (e) {
    console.error(`${tip}doExtractFn fail`, e);
  }
};

const parseJsCodeCom = (com: any) => {
  const namespace = com.def.namespace;
  if (namespace && NeedTransformCom.includes(namespace)) {
    if (
      typeof com.model?.data?.fns === 'object' &&
      'transformCode' in com.model?.data?.fns
    ) {
      delete com.model?.data?.fns?.transformCode;
      if (!com.model.data.fns.code) {
        return;
      }
      const code = doExtractFn(
        com.model.data.fns.code,
        `${com.title}(${com.id})`,
      );
      com.model.data.fns = code;
    } else if (typeof com.model?.data?.fns === 'string') {
      const code = doExtractFn(com.model.data.fns, `${com.title}(${com.id})`);
      com.model.data.fns = code;
    }
  } else if (
    [
      'mybricks.normal-pc.custom-render',
      'mybricks.normal-pc-chart.line',
    ].includes(namespace)
  ) {
    com.model.data.componentCode = doExtractFn(
      com.model.data.componentCode,
      `${com.title ?? com.id}`,
    );
  }
};

const transformScene = (scene: Record<string, any>) => {
  if (scene.refs) {
    (Object.values(scene.refs) || []).forEach(parseJsCodeCom);
  }
  if (scene.coms) {
    const tempObj = scene.coms;
    Object.values(tempObj).forEach(parseJsCodeCom);
  }
  return scene;
};

const transformGlobalFx = (json: any) => {
  if (json.global!.fxFrames) {
    json.global.fxFrames = (json.global.fxFrames ?? []).map(
      (fx: { coms: { [s: string]: unknown } | ArrayLike<unknown> }) => {
        (Object.values(fx.coms) ?? []).forEach(parseJsCodeCom);
        return fx;
      },
    );
  }
};

const transform = (json: Record<string, any>) => {
  Logger.info('[publishToCom] transform start');
  transformGlobalFx(json);
  if (json.hasPermissionFn) {
    json.hasPermissionFn = transformCodeByBabel(
      decodeURIComponent(json.hasPermissionFn),
      '全局方法-权限校验',
    );
  }
  Object.keys(json.plugins).forEach((pluginName) => {
    if (NeedTransformPlugin.includes(pluginName)) {
      json.plugins[pluginName] = json.plugins[pluginName].map(
        (service: any) => ({
          ...service,
          script: transformCodeByBabel(
            decodeURIComponent(service.script),
            '连接器',
          ),
        }),
      );
    }
  });

  // eslint-disable-next-line no-param-reassign
  if (json.deps) json = transformScene(json);
  else json.scenes = (json.scenes || []).map(transformScene);

  Logger.info('[publishToCom] transform finish');

  return json;
};

const extractCodeFn = (json: Record<string, any>) => {
  extractFns = [];
  return {
    transformJson: transform(json),
    extractFns: `[
  ${extractFns.join(',\n')}
]`,
  };
};

export { extractCodeFn };
