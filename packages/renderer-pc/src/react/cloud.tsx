import React, { useMemo, useContext } from "react";
import type { PropsWithChildren } from "react";

import { RendererContext } from ".";
import { SlotContext } from "./slot";
import { CanvasContext } from "./canvas";
import { useCheckPermissions } from "./hooks";
import { deepCopy, init2 } from "../basic";

interface CloudProps extends PropsWithChildren {
  /** 云组件namespace */
  namespace: string;
  /** 组件ID */
  comId: string;
}

export function Cloud({
  namespace,
  comId,
  children
}: CloudProps) {
  const rendererContext =
    useContext(RendererContext);
  const { CanvasStatus, env, permissions, getCloudJSON, observable, getComDef, logger } = rendererContext;
  const { hasPermission } = env;
  const { refs } = useContext(CanvasContext);
  const { next, dom } = useCheckPermissions({
    id: comId,
    refs,
    hasPermission,
    permissions,
  });
  if (!next) {
    return dom;
  }
  const { scope } = useContext(SlotContext);

  const { json, style, render } = useMemo(() => {
    // 先获取模块json
    const cloudJson = getCloudJSON(namespace);
    const comProps = refs.get({ comId, scope });
    const nextEnv = deepCopy(env);
    const {
      mainJson,
      getModuleJSON,
      canvasStatusMap,
      runExecutor,
      permissions
    } = init2({ json: cloudJson, env: nextEnv, CanvasStatus, observable, getComDef });

    runExecutor({
      json: mainJson,
      ref(refs) {
        const { config } = comProps.data;
        mainJson.inputs.forEach(({ id, type }: any) => {
          /** 配置项 */
          if (type === "config") {
            if (id in config) {
              refs.inputs[id](config[id]);
            }
          } else {
            comProps.inputs[id]((value: any) => {
              refs.inputs[id](value);
            });
          }
        });
        mainJson.outputs.forEach(({ id }: any) => {
          refs.outputs(id, comProps.outputs[id]);
        });

        refs.run();
      },
    })

    const render = (
      <RendererContext.Provider
        value={{
          json: cloudJson,
          env: nextEnv,
          getComDef,
          getModuleJSON,
          getCloudJSON,
          canvasStatusMap,
          runExecutor,
          permissions,
          observable,
          logger,
          CanvasStatus,
        }}
      >
        {children}
      </RendererContext.Provider>
    );

    return {
      json: cloudJson,
      style: comProps.style,
      render,
    };
  }, []);

  return (
    <div id={comId} key={comId} style={{ ...style }}>
      {render}
    </div>
  );
}