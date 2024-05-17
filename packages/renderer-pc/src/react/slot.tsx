import React, {
  useRef,
  useMemo,
  useEffect,
  useContext,
  createContext,
} from "react";

import { uuid } from "../utils";
import { Component } from "./component";
import { CanvasContext } from "./canvas";

// 插槽Context
export const SlotContext = createContext<any>({});

export function Slot(_props: {
  /** 插槽ID */
  id: string;
  /** 类型 */
  type?: "scope";
  /** 插槽样式 */
  style?: React.CSSProperties;
  children?: () => React.ReactNode;
}) {
  return <></>;
}

export function ScopeSlot({
  props,
  slot,
  slotId,
  parentComId,
  scopeProps,
  currentScope,
  children,
}: React.PropsWithChildren<{
  slot: any;
  slotId: any;
  parentComId: any;
  props: any;
  currentScope: any;
  scopeProps: any;
}>) {
  const { refs } = useContext(CanvasContext);
  const preInputValues = useRef(null);
  const { curScope, curProps } = useMemo(() => {
    let finalScope = currentScope;
    let finalProps = scopeProps;
    let hasNewScope = false;

    if (!finalScope) {
      if (slot?.type === "scope") {
        finalScope = {
          id: uuid(6),
          frameId: slotId,
          parentComId,
        };
        hasNewScope = true;
      }
    }

    if (props) {
      const ivs = props.inputValues;
      if (typeof ivs === "object") {
        if (hasNewScope) {
          finalProps = refs.get({
            comId: parentComId,
            slotId,
            scope: finalScope,
          });
        } else {
          finalScope = {
            ...finalScope,
            id: finalScope.id + "-" + uuid(6),
            parentScope: finalScope,
          };
          finalProps = refs.get({
            comId: parentComId,
            slotId,
            scope: finalScope,
          });
        }
        for (const pro in ivs) {
          finalProps.inputs[pro](ivs[pro], finalScope);
        }
      }
    }
    finalProps.run(finalScope);

    return { curScope: finalScope, curProps: finalProps };
  }, []);

  useEffect(() => {
    const paramsInputValues = props?.inputValues;
    if (paramsInputValues) {
      if (!preInputValues.current) {
        preInputValues.current = paramsInputValues;
      } else if (
        typeof paramsInputValues === "object" &&
        JSON.stringify(preInputValues.current) !==
          JSON.stringify(paramsInputValues)
      ) {
        preInputValues.current = paramsInputValues;
        for (const pro in paramsInputValues) {
          curProps.inputs[pro](paramsInputValues[pro], curScope);
        }
        curProps.run();
      }
    }
  }, [props?.inputValues]);

  useEffect(() => {
    return () => {
      curProps.destroy();
    };
  }, []);

  return (
    <SlotContext.Provider value={{ scope: curScope, slot, props: props || {} }}>
      {children}
    </SlotContext.Provider>
  );
}

export function NormalSlot({
  props,
  childrenProps,
}: {
  /** render函数传入，优先级更高 */
  props: {
    style: React.CSSProperties;
    wrap: (props: any) => any;
    itemWrap: (props: any) => any;
  };
  /** 子元素配置 */
  childrenProps: {
    style: React.CSSProperties;
    children: () => React.ReactNode;
  };
}) {
  const { refs } = useContext(CanvasContext);
  const slotContext = useContext(SlotContext);
  const { style, wrap } = props || {};
  if (typeof wrap === "function") {
    const itemAry = [];
    const { scope } = slotContext;

    slotContext.slot.comAry.forEach(({ id, name }) => {
      const props = refs.get({ comId: id, scope });
      itemAry.push({
        id,
        jsx: <Component id={id} scope={scope} />,
        name,
        inputs: props.inputsCallable,
        style: props.style,
      });
    });
    return wrap(itemAry);
  } else {
    const jsx = childrenProps.children?.();
    const slotStyle: React.CSSProperties = Object.entries(
      childrenProps.style || {},
    )
      .concat(Object.entries(style || {}))
      .reduce(
        (p, [key, value]) => {
          p[key] = value;
          return p;
        },
        {
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
        },
      );

    return (
      <div data-isslot="1" style={slotStyle}>
        {jsx}
      </div>
    );
  }
}
