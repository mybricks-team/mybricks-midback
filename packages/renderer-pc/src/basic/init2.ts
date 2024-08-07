import { executor } from "@mybricks/render-core";
import { createComponentGetter } from "./index";

/** 初始化 */
export function init({ json, env, observable, CanvasStatus, getComDef }) {
  let mainRefs;
  const { modules, scenes, global, permissions = [] } = json;
  /** 场景状态 */
  const canvasStatusMap: { [key: string]: typeof CanvasStatus } = {};

  // 注册各场景信息
  scenes.forEach((scene, index) => {
    const main = index === 0;
    canvasStatusMap[scene.id] = new CanvasStatus(main, scene, main);
    // 设置_v，excutor支持diff模式
    // scene._v = "2024-diff"; // TODO: 可以不设置
  });

  const { id: mainId, inputs, outputs, pinRels, slot } = scenes[0];
  /** 组件props入参 */
  // const relInputs = [];
  /** 组件ref透出api */
  // const refs = [];
  /** 组件ref透出api => promise */
  // const refsPromise = [];
  /** 被关联的输出项，不作为输出项处理 */
  // const relsOutputIdMap = {};
  /** 配置的默认值（默认入参，如果入参不存在使用默认值） */
  // const defaultComProps = {};

  // inputs?.forEach(({ id, type, extValues }) => {
  //   if (type === "config") {
  //     // 配置项，做为props
  //     /** 默认值 */
  //     const defaultValue = extValues?.config?.defaultValue;
  //     defaultComProps[id] = defaultValue;
  //     relInputs.push(id);
  //   } else {
  //     // 输入项，通过ref调用
  //     const rels = pinRels[`_rootFrame_-${id}`];
  //     if (rels) {
  //       // 有rels，认为是promise
  //       const outputId = rels[0];
  //       refsPromise.push({ inputId: id, outputId });
  //       relsOutputIdMap[outputId];
  //     } else {
  //       refs.push(id);
  //     }
  //   }
  // });

  /** 便于通过id查找全局FX信息 */
  const globalFxIdToFrame = {};
  global.fxFrames.forEach((fx) => {
    // 设置_v，excutor支持diff模式
    // fx._v = "2024-diff"; // TODO: 可以不设置
    globalFxIdToFrame[fx.id] = fx;
  });

  // 运行环境标识
  // env.runtime = {}; // TODO: 用父节点传入的
  // 画布相关
  env.canvas = {
    /** 类型，屏幕宽度小于414标识为mobile */
    get type() {
      return document.body.clientWidth <= 414 ? "mobile" : "pc"; // 初始化时根据屏幕宽度设置type
    },
    /** 打开场景 */
    open(canvasId, params, openType) {
      // TODO: openType 用于判断打开方式，popup为null
      const canvasStatus = canvasStatusMap[canvasId];
      canvasStatus.show = true;
      if (openType) {
        // 打开的是页面，关闭其他页面
        Object.entries(canvasStatusMap).forEach(([id, canvasStatus]) => {
          if (id !== canvasId) {
            canvasStatus.show = false;
          }
        });
      }
    },
  };
  /** 场景相关操作 */
  const scenesOperate = {
    /** 调用场景inputs */
    inputs({ frameId, parentScope, pinId, type, value }) {
      const canvasStatus = canvasStatusMap[frameId];

      if (canvasStatus.show) {
        // 如果场景已经打开
        canvasStatus.parentScope = parentScope; // 这个是用于场景的输出，调用parentScope.outputs[xx]
        const { refs, addTodo } = canvasStatus;
        if (refs) {
          // 已经注册
          refs.inputs[pinId](value);
        } else {
          // 未注册
          addTodo({ type: "inputs", params: { pinId, value } });
        }
      }
    },
    /** 变量绑定 - 暂时没人用，等需求再实现 */
    _notifyBindings(params) {
      // log("scenesOperate._notifyBindings: ", params);
    },
    /** 目前仅用于触发全局FX */
    open({ frameId, comProps, parentScope, todo }) {
      const fxFrame = globalFxIdToFrame[frameId];
      runExecutor({
        json: fxFrame,
        ref(refs) {
          const { inputs, outputs } = refs;

          // 注册fx输出
          fxFrame.outputs.forEach((output) => {
            outputs(output.id, (value) => {
              // 输出对应到fx组件的输出
              parentScope.outputs[output.id](value);
            });
          });

          /** 配置项 */
          const configs = comProps?.data?.configs;
          if (configs) {
            // 先触发配置项
            Object.entries(configs).forEach(([key, value]) => {
              inputs[key](value, void 0, false);
            });
          }
          // 调用inputs
          inputs[todo.pinId](todo.value, void 0, false);
          // 执行自执行组件
          refs.run();
        },
        type: "fx", // fxFrame.type === "fx"
      });
    },
    /** 获取全局变量信息 */
    getGlobalComProps(comId) {
      // 从主场景获取真实数据即可
      return mainRefs.get({ comId });
    },
    /** 触发全局变量inputs */
    exeGlobalCom({ com, pinId, value }) {
      // 从主场景获取全局变量信息，调用outputs
      mainRefs.get({ comId: com.id }).outputs[pinId](value, true, null, true);
    },
  };

  /** 获取组件定义 */
  // const getComDef = createComponentGetter(comDefs); // TODO: 用父节点传入的
  /** 获取模块json */
  function getModuleJSON(moduleId: string) {
    return modules[moduleId].json;
  }
  /** 执行executor */
  function runExecutor({ json, ref, type }: any) {
    executor(
      {
        json,
        env,
        ref(refs) {
          if (!["fx", "module"].includes(type)) {
            // fx、module 不需要注册到canvas
            canvasStatusMap[json.id].refs = refs;
          }
          ref(refs);
        },
        getComDef,
        // @ts-ignore
        scenesOperate,
      },
      {
        observable,
      },
    );
  }
  function hijackHasPermission(env) {
    const hasPermission = env.hasPermission;
    if (typeof hasPermission === "function") {
      Object.defineProperty(env, "hasPermission", {
        get: function () {
          return (value) => {
            if (typeof value === "string") {
              const permission = permissions.find(
                (permission) => permission.id === value,
              );
              return hasPermission({ permission });
            }
            return hasPermission(value);
          };
        },
      });
    } else {
      // 默认为有权限
      env.hasPermission = () => true;
    }
  }
  hijackHasPermission(env);

  /** 是页面出码 */
  // const isPage = !slot.showType; // 没有showType，默认为页面，showType === "module" 为组件

  /** 主场景JSON */
  const mainJson = canvasStatusMap[mainId].json;

  // runExecutor({
  //   json: mainJson, // 输入仅支持主场景
  //   ref(refs) {
  //     // currentRef.current = {
  //     //   refs,
  //     //   props: { ...comProps },
  //     // };
  //     mainRefs = refs;
  //     // 默认触发一次props输入
  //     // TODO: refs内操作应该完全由外部代理
  //     // relInputs.forEach((id) => {
  //     //   if (id in comProps) {
  //     //     refs.inputs[id](comProps[id]);
  //     //   } else {
  //     //     refs.inputs[id](defaultComProps[id]);
  //     //   }
  //     // });

  //     // // 注册事件
  //     // outputs?.forEach(({ id }) => {
  //     //   // 注册事件，默认为空函数，并且为非被关联输出项
  //     //   if (!relsOutputIdMap[id]) {
  //     //     refs.outputs(id, comProps[id] || function () {});
  //     //   }
  //     // });

  //     // if (isPage) {
  //     //   inputs.forEach(({ id }) => {
  //     //     refs.inputs[id]();
  //     //   });
  //     // }

  //     // // 执行自执行组件
  //     // refs.run();
  //   },
  // });

  return {
    // refs,
    // mainRefs,
    // relInputs,
    // getComDef,
    mainJson,
    getModuleJSON,
    canvasStatusMap,
    runExecutor,
    permissions,
    // CanvasStatus,
    // refsPromise,
    // isPage,
    // propertyChangeHandler: !isPage
    //   ? handlePropertyChangesForInputs({
    //       defaultProps: comProps,
    //       mainRefs,
    //       inputs: relInputs,
    //     })
    //   : null,
  };
}

// function handlePropertyChangesForInputs({ defaultProps, inputs, mainRefs }) {
//   const previousProps = { ...defaultProps };

//   return (currentProps) => {
//     // 对比入参是否变更
//     inputs.forEach((id) => {
//       if (id in previousProps) {
//         if (previousProps[id] !== currentProps[id]) {
//           previousProps[id] = currentProps[id];
//           mainRefs.inputs[id](currentProps[id]);
//         }
//       }
//     });
//   };
// }
