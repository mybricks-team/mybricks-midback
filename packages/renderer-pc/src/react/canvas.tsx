import React, { useContext, useState, createContext } from "react";

import { RendererContext } from ".";
import { SlotContext } from "./slot";
import { canvasRefRegister } from "../basic";

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
        canvasRefRegister({ refs, json, canvasStatus });
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
