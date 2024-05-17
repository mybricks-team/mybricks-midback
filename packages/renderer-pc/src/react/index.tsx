import React, {
  useRef,
  useMemo,
  useEffect,
  forwardRef,
  createContext,
  useImperativeHandle,
} from "react";
import {
  executor,
  observable,
  hijackReactcreateElement,
} from "@mybricks/render-core";
import { runJs } from "@mybricks/com-utils";
import { call as connectorCall } from "@mybricks/plugin-connector-http/runtime/index";
// @ts-ignore
import comlibCore from "@mybricks/comlib-core";

import { Component } from "./component";
import { Slot } from "./slot";
import { Canvas } from "./canvas";
import { Module } from "./module";
import { parseQuery } from "../utils";

export { 
  Component,
  Slot,
  Canvas,
  Module
}

hijackReactcreateElement({});

function log(...args) {
  return console.log(...args);
}

export interface RendererProps {
  json: any;
  config: {
    envList;
    executeEnv;
    locale;
    i18nLangContent;
    silent?;
    extractFns;
  };
  comDefs: any;
  props: any;
  children?: React.ReactNode;
}

const USE_CUSTOM_HOST = "__USE_CUSTOM_HOST__";

/** 全局Context */
export const RendererContext = createContext<any>({});

export const Renderer = forwardRef((props: RendererProps, ref: any) => {
  const {
    json,
    config,
    comDefs = {},
    props: { _console = {}, ...comProps },
    children,
  } = props;
  const {
    envList,
    executeEnv,
    locale,
    i18nLangContent,
    extractFns = [],
  } = config;
  const currentLocale = locale || navigator.language;
  const currentRef = useRef<any>();
  const { render, inputs, refs, refsPromise } = useMemo(() => {
    const { modules, scenes, global } = json;
    // 默认内置组件注册
    comlibCore.comAray.forEach(
      ({ namespace, runtime, data, inputs, outputs }: any) => {
        comDefs[namespace] = { data, runtime, inputs, outputs };
      },
    );
    /** 场景状态 */
    const canvasStatusMap = {};

    class CanvasStatus {
      constructor(
        public _show,
        public json,
        public main,
      ) {}

      refs;

      /** 更新状态 */
      refresh() {}

      /** 设置状态更新函数 - useState set */
      setRefresh = (refresh) => {
        this.refresh = refresh;
      };

      get show() {
        return this._show;
      }

      set show(show) {
        if (this._show !== show) {
          this._show = show;
          // 如果有变更，更新状态
          this.refresh();
        }
      }

      /** 私有_env */
      _env = {
        /** 当前场景 */
        currentScenes: {
          /** 关闭场景 */
          close: () => {
            this.show = false;
          },
        },
      };

      /** 触发inputs，未注册ui的场景，需要添加todo */
      inputTodos = [];
      /** 便于查找 */
      inputTodoPinIdToValue = {};

      addTodo = (todo) => {
        const { type, params } = todo;
        if (type === "inputs") {
          // 如果是输入项
          const { inputTodos, inputTodoPinIdToValue } = this;
          const { pinId, value } = params;
          // 防止同inputID多次添加
          if (!inputTodoPinIdToValue[pinId]) {
            inputTodos.push(pinId);
            inputTodoPinIdToValue[pinId] = value;
          } else {
            inputTodoPinIdToValue[pinId] = value;
          }
        }
      };

      runTodos = () => {
        const { inputTodos, inputTodoPinIdToValue, refs } = this;
        if (inputTodos.length) {
          // 执行todo
          const { inputs } = refs;
          inputTodos.forEach((pinId) => {
            inputs[pinId](inputTodoPinIdToValue[pinId], this.json.id);
          });
        }
      };
    }

    // 注册各场景信息
    scenes.forEach((scene, index) => {
      const main = index === 0;
      canvasStatusMap[scene.id] = new CanvasStatus(main, scene, main);
      // 设置_v，excutor支持diff模式
      scene._v = "2024-diff";
    });

    const { id: mainId, inputs, outputs, pinRels } = scenes[0];
    /** 组件props入参 */
    const relInputs = [];
    /** 组件ref透出api */
    const refs = [];
    /** 组件ref透出api => promise */
    const refsPromise = [];
    /** 被关联的输出项，不作为输出项处理 */
    const relsOutputIdMap = {};
    /** 配置的默认值（默认入参，如果入参不存在使用默认值） */
    const defaultComProps = {};

    inputs?.forEach(({ id, type, extValues }) => {
      if (type === "config") {
        // 配置项，做为props
        /** 默认值 */
        const defaultValue = extValues?.config?.defaultValue;
        defaultComProps[id] = defaultValue;
        relInputs.push(id);
      } else {
        // 输入项，通过ref调用
        const rels = pinRels[`_rootFrame_-${id}`];
        if (rels) {
          // 有rels，认为是promise
          const outputId = rels[0];
          refsPromise.push({ inputId: id, outputId });
          relsOutputIdMap[outputId];
        } else {
          refs.push(id);
        }
      }
    });

    /** 便于通过id查找全局FX信息 */
    const globalFxIdToFrame = {};
    global.fxFrames.forEach((fx) => {
      // 设置_v，excutor支持diff模式
      fx._v = "2024-diff";
      globalFxIdToFrame[fx.id] = fx;
    })

    /** 传入组件的env */
    const env = {
      runtime: {},
      canvas: {
        get type() {
          return document.body.clientWidth <= 414 ? "mobile" : "pc"; // 初始化时根据屏幕宽度设置type
        },
        /** 打开场景 */
        open(canvasId, params, openType) {
          // TODO: openType 用于判断打开方式，popup为null
          const canvasStatus = canvasStatusMap[canvasId];
          canvasStatus.show = true;
        },
      },
      scenesOperate: {
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
          const fxFrame = globalFxIdToFrame[frameId]
          runExecutor({
            json: fxFrame,
            ref(refs) {
              const { inputs, outputs } = refs
  
              // 注册fx输出
              fxFrame.outputs.forEach((output) => {
                outputs(output.id, (value) => {
                  // 输出对应到fx组件的输出
                  parentScope.outputs[output.id](value)
                })
              })

              /** 配置项 */
              const configs = comProps?.data?.configs
              if (configs) {
                // 先触发配置项
                Object.entries(configs).forEach(([key, value]) => {
                  inputs[key](value, void 0, false)
                })
              }
              // 调用inputs
              inputs[todo.pinId](todo.value, void 0, false)
              // 执行自执行组件
              refs.run()
            },
            type: "fx" // fxFrame.type === "fx"
          })
        },
        /** 获取全局变量信息 */
        getGlobalComProps(comId) {
          // 从主场景获取真实数据即可
          return currentRef.current.refs.get({comId});
        },
        /** 触发全局变量inputs */
        exeGlobalCom({ com, pinId, value }) {
          // 从主场景获取全局变量信息，调用outputs
          currentRef.current.refs.get({comId: com.id}).outputs[pinId](value, true, null, true)
        },
      },
      silent: _console.logger ? false : true,
      showErrorNotification: false,
      toCode: true, // 出码
      callConnector(connector, params, connectorConfig = {}) {
        // const plugin =
        //   window[connector.connectorName] ||
        //   window['@mybricks/plugins/service']
        //@ts-ignore
        const MYBRICKS_HOST = window?.MYBRICKS_HOST;

        if (isEqual(executeEnv, USE_CUSTOM_HOST)) {
          if (typeof MYBRICKS_HOST === "undefined") {
            console.error(`没有设置window.MYBRICKS_HOST变量`);
            return;
          } else if (!MYBRICKS_HOST.default) {
            console.error(`没有设置window.MYBRICKS_HOST.default`);
            return;
          }
        }

        let newParams = params;

        if (isEqual(executeEnv, USE_CUSTOM_HOST)) {
          if (params instanceof FormData) {
            newParams.append("MYBRICKS_HOST", JSON.stringify(MYBRICKS_HOST));
          } else {
            newParams = { ...params, MYBRICKS_HOST: { ...MYBRICKS_HOST } };
          }
        }
        /** 兼容云组件，云组件会自带 script */
        const curConnector = connector.script
          ? connector
          : (json.plugins[connector.connectorName] || []).find(
              (con) => con.id === connector.id,
            );

        return connectorCall({ ...connector, ...curConnector }, newParams, {
          ...connectorConfig,
          /** http-sql表示为领域接口 */
          before: (options) => {
            return {
              ...options,
              url: shapeUrlByEnv(
                envList,
                executeEnv,
                options.url,
                MYBRICKS_HOST,
              ),
            };
          },
        });
      },
      i18n(title) {
        //多语言
        if (typeof title?.id === "undefined") return title;
        return (
          i18nLangContent[title.id]?.content?.[currentLocale] ||
          JSON.stringify(title)
        );
        //return title;
      },
      get extractFns() {
        return extractFns;
      },
      get vars() {
        // 环境变量
        return {
          get getExecuteEnv() {
            return () => executeEnv;
          },
          get getQuery() {
            return () => {
              return parseQuery(location.search);
            };
          },
          //antd 语言包地址
          get locale() {
            return currentLocale;
          },
          get getProps() {
            // 获取主应用参数方法，如：token等参数，取决于主应用传入
            return () => {
              if (!props) return undefined;
              return props;
            };
          },
          get getCookies() {
            return () => {
              const cookies = document.cookie.split("; ").reduce((s, e) => {
                const p = e.indexOf("=");
                s[e.slice(0, p)] = e.slice(p + 1);
                return s;
              }, {});

              return cookies;
            };
          },
          get getRouter() {
            const isUri = (url) => {
              return /^http[s]?:\/\/([\w\-\.]+)+[\w-]*([\w\-\.\/\?%&=]+)?$/gi.test(
                url,
              );
            };
            return () => ({
              reload: () => location.reload(),
              redirect: ({ url }) => location.replace(url),
              back: () => history.back(),
              forward: () => history.forward(),
              pushState: ({ state, title, url }) => {
                if (isUri(url)) {
                  //兼容uri
                  location.href = url;
                } else {
                  history.pushState(state, title, url);
                }
              },
              openTab: ({ url, title }) => open(url, title || "_blank"),
            });
          },
        };
      },
      get hasPermission() {
        return ({ permission, key }) => {
          if (!json?.hasPermissionFn) {
            return true;
          }

          const code = permission?.register?.code || key;

          let result;

          try {
            result = runJs(decodeURIComponent(json?.hasPermissionFn), [
              { key: code },
            ]);

            if (typeof result !== "boolean") {
              result = true;
              console.warn(
                `权限方法返回值类型应为 Boolean 请检查，[key] ${code}; [返回值] type: ${typeof result}; value: ${JSON.stringify(
                  result,
                )}`,
              );
            }
          } catch (error) {
            result = true;
            console.error(`权限方法出错 [key] ${code}；`, error);
          }

          return result;
        };
      },
    };

    /** 获取组件定义 */
    function getComDef(def) {
      return comDefs[def.namespace];
    }
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
        },
        {
          observable
        },
      );
    }

    runExecutor({
      json: canvasStatusMap[mainId].json, // 输入仅支持主场景
      ref(refs) {
        currentRef.current = {
          refs,
          props: { ...comProps },
        };
        // 默认触发一次props输入
        relInputs.forEach((id) => {
          if (id in comProps) {
            refs.inputs[id](comProps[id]);
          } else {
            refs.inputs[id](defaultComProps[id]);
          }
        });

        // 注册事件
        outputs?.forEach(({ id }) => {
          // 注册事件，默认为空函数，并且为非被关联输出项
          if (!relsOutputIdMap[id]) {
            refs.outputs(id, comProps[id] || function () {});
          }
        });

        // 执行自执行组件
        refs.run();
      },
    });

    const render = (
      <RendererContext.Provider
        value={{
          json,
          env,
          getComDef,
          getModuleJSON,
          canvasStatusMap,
          runExecutor,
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
      inputs: relInputs,
      refs,
      refsPromise,
      render,
    };
  }, []);

  useImperativeHandle(
    ref,
    () => {
      const { current } = currentRef;
      const res = {};

      refs.reduce((p, c) => {
        p[c] = current.refs.inputs[c];
        return p;
      }, res);

      refsPromise.reduce((p, c) => {
        const { inputId, outputId } = c;
        p[inputId] = (value) => {
          return new Promise((resolve) => {
            current.refs.outputs(outputId, resolve);
            current.refs.inputs[inputId](value);
          });
        };
        return p;
      }, res);

      return res;
    },
    [],
  );

  useUpdateEffect(() => {
    const { props, refs } = currentRef.current;
    // 对比入参是否变更
    inputs.forEach((id) => {
      if (id in props) {
        if (props[id] !== comProps[id]) {
          props[id] = comProps[id];
          refs.inputs[id](comProps[id]);
        }
      }
    });
  }, [comProps]);

  return render;
});

export default {
  Renderer,
  Canvas,
  Slot,
  Component
}

const shapeUrlByEnv = (envList, env, url, mybricksHost) => {
  if (!envList || !env || /^(https?|ws)/.test(url)) return url;
  if (env === USE_CUSTOM_HOST) {
    return combineHostAndPath(mybricksHost.default, url);
  }
  const data = (envList || []).find((item) => item.name === env);
  if (!data || !data.value) return url;
  return data.value + url;
};

const combineHostAndPath = (host, path) => {
  const _host = host.replace(/\/$/, "");
  const _path = path.replace(/^\//, "");
  return _host + "/" + _path;
};

const isEqual = (param1, param2) => {
  return param1 === param2;
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

