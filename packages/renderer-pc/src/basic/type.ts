/** 通用Renderer参数 */
export interface NormalRendererProps {
  json: any;
  config: {
    envList;
    executeEnv;
    locale;
    i18nLangContent;
    silent?;
    extractFns;
  };
  comDefs: any;
  props: any;
}
