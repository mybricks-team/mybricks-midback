import { ISymbolValue } from "..";
import { GetMaterialContent, Scene, ToJSON } from "../../types";
import { collectModuleCom, getComlibContent } from "../../utils";
import processReactRelativeSymbols from "./react-relative-symbols";
import { processStyleRelativeSymbols } from "./style-relative-symbols";
import processVueRelativeSymbols from "./vue-relative-symbols";

interface IProps {
  json: any;
  comLibs: any;
  fileId: number;
  getMaterialContent: GetMaterialContent;
}

function genUiCode({ json, namespaceToComDefs }: any) {
  /** 场景代码 */
  let canvasCode = "";
  /** 模块代码 */
  let modulesCode = "";
  const { modules, scenes } = json;
  const moduleIdToIndex: any = {};

  if (modules) {
    Object.entries(modules).forEach(
      ([moduleId, { title, json }]: any, index: number) => {
        moduleIdToIndex[moduleId] = index;
        // 生成模块代码
        modulesCode =
          modulesCode +
          `/** ${title} */
        function Module${index}({ id }: ModuleProps) {
          return (
            <Module id="${moduleId}" comId={id}>
              ${
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          getBaeJsonCode(json, false)
          }
            </Module>
          );
        }
      `;
      },
    );
  }

  scenes.forEach((scene: any, index: number) => {
    canvasCode =
      canvasCode +
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      `<Canvas id="${scene.id}">${getBaeJsonCode(scene, !index)}</Canvas>`;
  });

  function getBaeJsonCode(json: any, root: boolean) {
    let runtimeCode = "--next--";
    const { slot, coms } = json;
    let classNameCode = "";
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    let styleCode = JSON.stringify(getSlotStyle(slot, true));

    if (json.type !== "popup") {
      // 不是弹窗场景，有外层样式
      if (root) {
        // 根场景，默认接收className和style
        classNameCode = "className={props.className}";
        styleCode = styleCode.replace("}", ",...props.style}");
      }

      runtimeCode = `<div ${classNameCode} style={${styleCode}}>--next--</div>`;
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return runtimeCode.replace("--next--", deepSlot(slot, coms));
  }

  function deepSlot(slot: any, coms: any) {
    let slotCode = "";
    const { style, comAry, layoutTemplate } = slot;

    if (style.layout === "smart") {
      layoutTemplate.forEach((com: any) => {
        if (com.def) {
          // UI组件
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          slotCode = slotCode + getUIComponentCode(com, coms);
        } else {
          // DOM节点
          slotCode =
            slotCode +
            `<div style={${JSON.stringify(com.style)}}>${deepSlot({ layoutTemplate: com.elements, style: { layout: "smart" } }, coms)}</div>`;
        }
      });
    } else {
      comAry.forEach((com: any) => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        slotCode = slotCode + getUIComponentCode(com, coms);
      });
    }

    return slotCode;
  }

  function getUIComponentCode(com: any, coms: any) {
    const { id, def, slots } = com;
    const isModule = def.namespace === "mybricks.core-comlib.module";
    let componentName;

    if (isModule) {
      const comInfo = coms[id];
      const { definedId } = comInfo.model.data;
      componentName = `Module${moduleIdToIndex[definedId]}`;
    } else {
      componentName = namespaceToComDefs[def.namespace].runtimeName;
    }
    if (slots) {
      return `<${componentName} id="${id}">${Object.entries(slots)
        .map(([key, slot]: any) => {
          const isScope = slot.type === "scope";
          const useFragment =
            slot.style.layout === "smart"
              ? slot.layoutTemplate.length > 1
              : slot.comAry.length > 1;
          const nextCode = deepSlot(slot, coms);
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          return `<Slot id="${key}" ${isScope ? 'type="scope"' : ""} style={${JSON.stringify(getSlotStyle(slot))}}>{() => {
            return (
              ${useFragment ? `<>${nextCode}</>` : (nextCode || "<></>")}
            )
          }}</Slot>`;
        })
        .join("")}</${componentName}>`;
    } else {
      return `<${componentName} id="${id}"/>`;
    }
  }

  // TODO:之后没有这一步了
  function getSlotStyle(slot: any, root?: boolean) {
    const {
      style: { layout, position, ...otherStyle },
      type,
      showType,
    } = slot;
    const slotStyle = {
      position: ["smart"].includes(position) ? "relative" : position,
      ...otherStyle,
    };
    // 判断布局方式
    if (layout === "flex-column") {
      slotStyle.display = "flex";
      slotStyle.flexDirection = "column";
    } else if (layout === "flex-row") {
      slotStyle.display = "flex";
      slotStyle.flexDirection = "row";
    } else {
      // 不是flex布局，删除引擎带来的运行时无用的样式
      Reflect.deleteProperty(slotStyle, "rowGap");
      Reflect.deleteProperty(slotStyle, "columnGap");
      Reflect.deleteProperty(slotStyle, "flexWrap");
      Reflect.deleteProperty(slotStyle, "alignItems");
      Reflect.deleteProperty(slotStyle, "justifyContent");
      Reflect.deleteProperty(slotStyle, "flexDirection");
      Reflect.deleteProperty(slotStyle, "display");
    }

    if (showType === "module" || type === "module") {
      if (slotStyle.heightAuto) {
        slotStyle.height = "fit-content";
      } else if (slotStyle.heightFull) {
        slotStyle.height = "100%";
      }
      if (slotStyle.widthAuto) {
        slotStyle.width = "fit-content";
      } else if (slotStyle.widthFull) {
        slotStyle.width = "100%";
      }
    } else if (root) {
      // 画布根节点，宽高默认100%即可
      slotStyle.width = "100%";
      slotStyle.height = "100%";
    }

    // 删除引擎带来的运行时无用的样式
    Reflect.deleteProperty(slotStyle, "widthFact");
    Reflect.deleteProperty(slotStyle, "heightFact");
    Reflect.deleteProperty(slotStyle, "widthAuto");
    Reflect.deleteProperty(slotStyle, "heightAuto");
    Reflect.deleteProperty(slotStyle, "widthFull");
    Reflect.deleteProperty(slotStyle, "heightFull");
    // 模块脏数据
    Reflect.deleteProperty(slotStyle, "top");
    Reflect.deleteProperty(slotStyle, "left");
    // 引擎返回的，干嘛用的这是
    Reflect.deleteProperty(slotStyle, "zoom");
    // 编辑器带来的脏数组...
    Reflect.deleteProperty(slotStyle, "paddingType")

    slotStyle.overflow = root ? (showType === "module" ? "hidden" : "hidden auto") : "hidden";

    return slotStyle;
  }

  return {
    canvasCode,
    modulesCode: modulesCode ? `interface ModuleProps {
      /** 模块组件ID */
      id: string;
    }
    ${modulesCode}
    ` : "",
  };
}

function getComDeps(json: ToJSON) {
  const ignoreNamespaces = [
    'mybricks.core-comlib.fn',
    'mybricks.core-comlib.var',
    'mybricks.core-comlib.type-change',
    'mybricks.core-comlib.connector',
    'mybricks.core-comlib.frame-input',
    'mybricks.core-comlib.frame-output',
    'mybricks.core-comlib.scenes',
    'mybricks.core-comlib.defined-com',
    'mybricks.core-comlib.module',
    'mybricks.core-comlib.group',
    'mybricks.core-comlib.selection',
  ];
  let definedComsDeps: any[] = [];
  let modulesDeps: any[] = [];

  if (json.definedComs) {
    Object.keys(json.definedComs).forEach((key) => {
      definedComsDeps = [
        ...definedComsDeps,
        ...json.definedComs[key].json.deps,
      ];
    });
  }

  const modules = json.modules;
  if (modules) {
    Object.keys(modules).forEach((key) => {
      modulesDeps = [...modulesDeps, ...modules[key].json.deps];
    });
  }

  let deps: { namespace: string; version: string; rtType?: string }[] = [
    ...(Array.isArray(json.scenes) ? json.scenes : [])
      .reduce((pre, scene) => [...pre, ...scene.deps], [] as Scene['deps'])
      .filter((item) => !ignoreNamespaces.includes(item.namespace)),
    ...(json.global?.fxFrames || [])
      .reduce((pre, fx) => [...pre, ...fx.deps], [] as Scene['deps'])
      .filter((item) => !ignoreNamespaces.includes(item.namespace)),
    ...definedComsDeps.filter(
      (item) => !ignoreNamespaces.includes(item.namespace),
    ),
    ...modulesDeps.filter((item) => !ignoreNamespaces.includes(item.namespace)),
  ];

  let res: any[] = [];
  for (let dep of deps) {
    if (!res.find((item) => item.namespace === dep.namespace)) {
      res.push(dep);
    }
  }
  return res;
}

async function getImportsStr(comLibs: IProps['comLibs'], getMaterialContent: GetMaterialContent, json: ToJSON) {
  const comDeps = getComDeps(json);

  let comDefs = '';
  let comImportsVueStr = '';
  let comImportsReactStr = '';
  /** 通过namespace查询组件信息 */
  let namespaceToComDefs: any = {};

  const comlibDeps = await Promise.all(
    comLibs.map(async (item: any) => {
      const { namespace } = item;
      const res = await getComlibContent(item, getMaterialContent);
      return {
        namespace,
        deps: res,
      };
    }),
  );
  const { newComDefs } = collectModuleCom(comDeps, comlibDeps);

  newComDefs.forEach((item: any, index: number) => {
    namespaceToComDefs[item.namespace] = item;
    comImportsVueStr += `import ${item.runtimeName} from "${item.libraryName}/es/${item.runtimeName}"` + '\n';

    if (!item.rtType) {
      // 仅需要导出ui组件
      comImportsReactStr += `${item.runtimeName},`;
    }

    if (index === comDeps.length - 1) {
      comDefs += `'${item.namespace}': ${item.runtimeName}`;
    } else {
      comDefs += `'${item.namespace}': ${item.runtimeName},` + '\n';
    }
  });

  return {
    comImportsReactStr,
    comImportsVueStr,
    comDefs,
    namespaceToComDefs,
  };
}

export default async function processComRelativeSymbols({ json, comLibs, fileId, getMaterialContent }: IProps): Promise<ISymbolValue[]> {
  const { comImportsReactStr, comImportsVueStr, comDefs, namespaceToComDefs } = await getImportsStr(comLibs, getMaterialContent, json);

  const { canvasCode, modulesCode } = genUiCode({ json, namespaceToComDefs });

  return [
    { symbol: 'reactComponentImports', value: comImportsReactStr },
    { symbol: 'comDefs', value: `{${comDefs}}` },
    { symbol: 'reactUI', value: canvasCode },
    { symbol: 'modulesCode', value: modulesCode },
    ...await processReactRelativeSymbols(json, comLibs, getMaterialContent),
    { symbol: 'vueComponentImports', value: comImportsVueStr },
    ...processVueRelativeSymbols(json),
    ...await processStyleRelativeSymbols(fileId, json)
  ]
}