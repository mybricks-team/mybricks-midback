import React, { useContext, useState, createContext } from "react";

import { RendererContext } from ".";
import { SlotContext } from "./slot";

interface CanvsaProps {
  /** 场景ID */
  id: string;
}

// 场景Context
export const CanvasContext = createContext<any>({});

export function Canvas({ id, children }: React.PropsWithChildren<CanvsaProps>) {
  const [, refresh] = useState(false);
  const { canvasStatusMap, runExecutor } = useContext(RendererContext);
  const canvasStatus = canvasStatusMap[id];
  const { json, show, setRefresh } = canvasStatus;

  setRefresh(() => refresh((bool) => !bool));

  if (show && !canvasStatus.refs) {
    // 展示并且没有注册refs
    runExecutor({
      json,
      ref(refs) {
        canvasStatus.refs = refs;
        canvasStatus.runTodos();

        const isPopup = json.type === "popup";
        const { outputs } = refs;
        // 弹出框场景，部分输出自动关闭
        json.outputs.forEach((output) => {
          const outputId = output.id;
          outputs(outputId, (value) => {
            if (outputId !== "apply" && isPopup) {
              // 输出不是apply并且是popup场景
              // 关闭场景
              canvasStatus.show = false;
            }
            canvasStatus.parentScope.outputs[outputId](value);
            canvasStatus.parentScope = null;
          });
        });
      },
    });
  }

  return (
    show && (
      <CanvasContext.Provider value={canvasStatus}>
        <SlotContext.Provider
          value={{ scope: null, slot: json.slot, props: {} }}
        >
          {children}
        </SlotContext.Provider>
      </CanvasContext.Provider>
    )
  );
}
