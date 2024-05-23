import React, { useMemo, useContext } from "react";

import { RendererContext } from ".";
import { SlotContext } from "./slot";
import { CanvasContext } from "./canvas";
import { useCheckPermissions } from "./hooks";

export function Module({ id, comId, children }: React.PropsWithChildren<{
  /** 模块ID */
  id: string;
  /** 组件ID */
  comId: string;
}>) {
  const { runExecutor, getModuleJSON, CanvasStatus, env, permissions } = useContext(RendererContext);
  const { hasPermission } = env;
  const { refs } = useContext(CanvasContext)
  const { next, dom } = useCheckPermissions({ id: comId, refs, hasPermission, permissions })
  if (!next) {
    return dom
  }
  const { scope } = useContext(SlotContext);

  const { canvasStatus, json, style } = useMemo(() => {
    // 先获取模块json
    const moduleJson = getModuleJSON(id)
    const comProps = refs.get({ comId, scope });
    const { inputs: propsInputs, outputs: propsOutputs } = comProps;
    const { inputs, outputs } = moduleJson;
    const configs = comProps.data.configs;
    const canvasStatus = new CanvasStatus(true, moduleJson, false);

    runExecutor({
      json: moduleJson,
      ref(refs) {
        canvasStatus.refs = refs
        if (configs) {
          // 配置项直接输入
          for (let id in configs) {
            refs.inputs[id](configs[id]);
          }
        }
    
        // 注册inputs，与组件同理
        inputs.forEach(({id}) => {
          propsInputs[id]((value) => {
            refs.inputs[id](value);
          })
        })
        
        // 注册outputs，与组件同理
        outputs.forEach(({id}) => {
          refs.outputs(id, propsOutputs[id]);
        })
    
        // 执行自执行组件
        refs.run();
      },
      type: "module" // json.type === "module"
    })

    return {
      canvasStatus,
      json: moduleJson,
      style: comProps.style
    }
  }, []);

  return (
    <div id={comId} key={comId} style={{...style}}>
      <CanvasContext.Provider value={canvasStatus}>
        <SlotContext.Provider
          value={{ scope: null, slot: json.slot, props: {} }}
        >
          {children}
        </SlotContext.Provider>
      </CanvasContext.Provider>
    </div>
  );
}