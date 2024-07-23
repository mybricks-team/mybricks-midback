import React, { useMemo, useState, useLayoutEffect, useContext } from "react";

import { SlotContext, ScopeSlot, NormalSlot } from "./slot";
import { RendererContext } from ".";
import { CanvasContext } from "./canvas";
import { useCheckPermissions } from "./hooks";

// TODO: 后续可以把数据抽出去，不用这样遍历查找
const findComById = ({ comAry, comId }) => {
  for (let com of comAry) {
    if (com.id === comId) {
      if (com.def) {
        return com
      } else if (com.elements) {
        const res = findComById({ comAry: com.elements, comId })
        if (res) {
          return res
        }
      }
    }
  }

  return null;
}

export function Component({
  id,
  children,
}: React.PropsWithChildren<{ id: string; scope?: any }>) {
  const { getComDef, env, logger, permissions } = useContext(RendererContext);
  const { refs, _env } = useContext(CanvasContext);
  const { hasPermission } = env;
  const { next, dom } = useCheckPermissions({
    id,
    refs,
    hasPermission,
    permissions,
  });
  if (!next) {
    return dom;
  }
  const [, setShow] = useState(false);
  const {
    scope,
    slot,
    props: { itemWrap },
  } = useContext(SlotContext);
  const { name, proxySlots, parentSlot, comDef, comProps } = useMemo(() => {
    const { name, def, slots } = findComById({ comAry: slot.style.layout === "smart" ? slot.layoutTemplate : slot.comAry, comId: id  })
    // const { name, def, slots } = slot.comAry.find((com) => com.id === id);
    const comProps = refs.get({ comId: id, scope });
    const comDef = getComDef(def);
    const proxySlots = new Proxy(
      {},
      {
        get(_, slotId) {
          let currentScope = null;

          if (scope) {
            currentScope = {
              id: scope.id + "-" + scope.frameId,
              frameId: slotId,
              parentComId: id,
              parent: scope,
            };
          }

          const scopeProps = refs.get({
            comId: id,
            slotId,
            scope: currentScope,
          });

          return {
            render(props) {
              let childrenProps;

              if (children) {
                if (Array.isArray(children)) {
                  const child = children.find(
                    (child) => child.props.id === slotId,
                  );
                  childrenProps = child.props;
                } else {
                  // @ts-ignore
                  childrenProps = children.props;
                }
              }

              return (
                <ScopeSlot
                  props={props}
                  scopeProps={scopeProps}
                  currentScope={currentScope}
                  slot={slots[slotId]}
                  slotId={slotId}
                  parentComId={id}
                >
                  <NormalSlot props={props} childrenProps={childrenProps} />
                </ScopeSlot>
              );
            },
            get size() {
              return !!slots[slotId]?.comAry?.length;
            },
            _inputs: scopeProps._inputs,
            inputs: scopeProps.inputs,
            outputs: scopeProps.outputs,
          };
        },
      },
    );

    let parentSlot;
    if (comProps.frameId && comProps.parentComId) {
      const finalScope = scope?.parentScope || scope;
      const slotProps = refs.get({
        comId: comProps.parentComId,
        slotId: comProps.frameId,
        scope: finalScope?.parent ? finalScope : null,
      });
      if (slotProps) {
        parentSlot = {
          get _inputs() {
            return new Proxy(
              {},
              {
                get(target, name) {
                  const fn = slotProps._inputRegs[name];
                  return fn;
                },
              },
            );
          },
        };
      }
    }

    return {
      name,
      comDef,
      comProps,
      proxySlots,
      parentSlot,
    };
  }, []);

  const {
    data,
    title,
    style,
    inputs: myInputs,
    outputs: myOutputs,
    _inputs: _myInputs,
    _outputs: _myOutputs,
    _notifyBindings: _myNotifyBindings,
  } = comProps;

  let jsx = comDef.runtime({
    id,
    env,
    _env,
    data,
    name,
    title,
    style,
    inputs: myInputs,
    outputs: myOutputs,
    _inputs: _myInputs,
    _outputs: _myOutputs,
    _notifyBindings: _myNotifyBindings,
    slots: proxySlots,
    createPortal: {},
    parentSlot,
    onError: {},
    logger,
  });

  useLayoutEffect(() => {
    setShow(true); // 在子组件写入前触发状态更新，会执行上次等待的useEffect，内部inputs是同步执行，最终挂载dom
  }, []);

  if (typeof itemWrap === "function") {
    jsx = itemWrap({ id, jsx, name, scope });
  }

  return (
    <div id={id} key={id} style={{ ...style }}>
      {jsx}
    </div>
  );
}
