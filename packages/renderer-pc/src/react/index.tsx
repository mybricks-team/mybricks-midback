import React, {
  useRef,
  useMemo,
  useEffect,
  forwardRef,
  createContext,
  useImperativeHandle,
} from "react";
import { observable, hijackReactcreateElement } from "@mybricks/render-core";

import { Component } from "./component";
import { Slot } from "./slot";
import { Canvas } from "./canvas";
import { Module } from "./module";
import { init, generateEnv, generateRef } from "../basic";
import type { NormalRendererProps } from "../basic";

export { Component, Slot, Canvas, Module };

hijackReactcreateElement({});

export interface RendererProps extends NormalRendererProps {
  children?: React.ReactNode;
}

/** 全局Context */
export const RendererContext = createContext<any>({});

export const Renderer = forwardRef((props: RendererProps, ref: any) => {
  const {
    json,
    comDefs = {},
    props: { _console = {}, ...comProps },
    children,
  } = props;
  const currentRef = useRef<any>();
  const { render, refs, refsPromise, propertyChangeHandler } = useMemo(() => {
    /** 传入组件的env */
    const env = generateEnv(props);
    const {
      refs,
      mainRefs,
      getComDef,
      getModuleJSON,
      canvasStatusMap,
      runExecutor,
      permissions,
      CanvasStatus,
      refsPromise,
      propertyChangeHandler,
    } = init({ json, env, comProps, comDefs, observable });
    currentRef.current = {
      refs: mainRefs,
      props: { ...comProps },
    };
    const render = (
      <RendererContext.Provider
        value={{
          json,
          env,
          getComDef,
          getModuleJSON,
          canvasStatusMap,
          runExecutor,
          permissions,
          logger: {
            error(...args) {
              console.error(...args);
            },
          },
          CanvasStatus,
        }}
      >
        {children}
      </RendererContext.Provider>
    );

    return {
      refs,
      refsPromise,
      render,
      propertyChangeHandler,
    };
  }, []);

  propertyChangeHandler &&
    useImperativeHandle(
      ref,
      () =>
        generateRef({ mainRefs: currentRef.current.refs, refs, refsPromise }),
      [],
    );

  propertyChangeHandler &&
    useUpdateEffect(() => {
      propertyChangeHandler(comProps);
    }, [comProps]);

  return render;
});

export default {
  Renderer,
  Canvas,
  Slot,
  Component,
};

function useUpdateEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList,
): void {
  const isInit = useRef<boolean>(false);

  useEffect(() => {
    if (isInit.current) {
      effect();
    } else {
      isInit.current = true;
    }
  }, deps);
}