import React, { useMemo, useState, useLayoutEffect, useContext } from "react";

import { SlotContext, ScopeSlot, NormalSlot } from "./slot";
import { RendererContext } from ".";
import { CanvasContext } from "./canvas";

export function Component({
  id,
  children,
}: React.PropsWithChildren<{ id: string; scope?: any }>) {
  const [, setShow] = useState(false);
  const { getComDef, env, logger, permissions } = useContext(RendererContext);
  const { refs, _env } = useContext(CanvasContext);
  const { hasPermission } = env;
  const comInfo = refs.getComInfo(id);
  const {
    scope,
    slot,
    props: { itemWrap },
  } = useContext(SlotContext);
  const { name, def, slots } = slot.comAry.find((com) => com.id === id);
    // TODO: 封装到hook
  const permissionsId = comInfo.model.permissions?.id;
  if (permissionsId && typeof hasPermission === 'function') {
    const permissionInfo = hasPermission(permissionsId);
    if (!permissionInfo || (typeof permissionInfo !== 'boolean' && !permissionInfo.permission)) {
      // 没有权限信息或权限信息里的permission为false
      const envPermissionInfo = permissions.find((p: any) => p.id === permissionsId);
      const type = permissionInfo?.type || envPermissionInfo?.register.noPrivilege;
      if (type === 'hintLink') {
        return (
          <div key={id}>
            <a
              href={permissionInfo?.hintLinkUrl || envPermissionInfo.hintLink}
              target="_blank"
              style={{textDecoration: 'underline'}}
            >
              {permissionInfo?.hintLinkTitle || envPermissionInfo.register.title}
            </a>
          </div>
        )
      }
      return
    }
  }
  const comProps = refs.get({ comId: id, scope });
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

        const scopeProps = refs.get({ comId: id, slotId, scope: currentScope });

        return {
          render(props) {
            let childrenProps;

            if (Array.isArray(children)) {
              const child = children.find((child) => child.props.id === slotId);
              childrenProps = child.props;
            } else {
              // @ts-ignore
              childrenProps = children.props;
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

  const parentSlot = useMemo(() => {
    if (comProps.frameId && comProps.parentComId) {
      const finalScope = scope?.parentScope || scope;
      const slotProps = refs.get({
        comId: comProps.parentComId,
        slotId: comProps.frameId,
        scope: finalScope?.parent ? finalScope : null,
      });
      if (slotProps) {
        return {
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
  }, []);
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
