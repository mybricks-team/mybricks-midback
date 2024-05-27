import comlibCore from "@mybricks/comlib-core";

export function createComponentGetter(comDefs) {
  // 默认内置组件注册
  comlibCore.comAray.forEach(
    ({ namespace, runtime, data, inputs, outputs }: any) => {
      comDefs[namespace] = { data, runtime, inputs, outputs };
    },
  );

  /** 获取组件定义 */
  return (def) => {
    return comDefs[def.namespace];
  }
}
