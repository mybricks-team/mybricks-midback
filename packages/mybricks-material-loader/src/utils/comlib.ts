import { ComLibType } from "src/global";
import { SourceEnum, MY_SELF_ID } from "../constant";
import { loadScript } from "../loader/loadScript";

export const getValidUrl = (url = '/api/material/components/combo') => {
  const tempPrefix = location.origin || 'https://xxx.com'
  if (url.indexOf('://') !== -1) {
    return new URL(url)
  }
  return new URL(tempPrefix + url)
}

export class ComboComlibURL {
  private _URL_ = new URL('https://xxx.com')

  constructor(url?) {
    const _url = getValidUrl(url)
    this._URL_ = _url
  }

  getComponents = () => {
    let comAry: any = this._URL_.searchParams.get('components')
    comAry = comAry.split(',')
    let components = []
    if (Array.isArray(comAry)) {
      comAry.forEach(com => {
        components.push({
          namespace: com.split('@')[0],
          version: com.split('@')[1]
        })
      })
    }
    return components
  }

  setComponents = (components) => {
    if (!Array.isArray(components)) {
      return
    }
    const queryStr = components.reduce((acc, cur) => {
      return `${acc}${!!acc ? ',' : ''}${cur.namespace}@${cur.version}`
    }, '')
    this._URL_.searchParams.set('components', queryStr)
  }

  deleteComponents = (namespace: string) => {
    const coms = this.getComponents()
    const deleteIdx = coms.findIndex(com => com.namespace === namespace)
    if (deleteIdx) {
      coms.splice(deleteIdx, 1)
    }
    this.setComponents(coms)
  }

  toRtUrl = () => {
    const rtURL = new URL(this.toString());
    rtURL.searchParams.set('comboType', 'rt');
    return rtURL.toString();
  }

  toEditUrl = () => {
    return this.toString()
  }

  toString = () => {
    return this._URL_.toString()
  }
}

export const getMySelfLibComsFromUrl = (url): Promise<ComLibType| any> => {

  if (url?.split('components=')?.[1]?.length === 0) {
    window[SourceEnum.ComLib_Edit].unshift({
      comAray: [],
      id: '_myself_',
      title: '我的组件',
      defined: true,
    });
    // 跳过空请求
    return Promise.resolve([])
  }

  return new Promise((resolve, reject) => {
    myRequire([url], () => {
      reject(new Error('加载我的组件失败'))
    }).then(({ styles }) => {
      /** 添加之后会有多组件存储于__comlibs_edit_需要合并下 */
      const firstComIdx = window[SourceEnum.ComLib_Edit].findIndex(
        (lib) => lib.id === MY_SELF_ID,
      );
      const lastComIndex = window[SourceEnum.ComLib_Edit].findLastIndex(
        (lib) => lib.id === MY_SELF_ID,
      );
      if (firstComIdx !== lastComIndex) {
        window[SourceEnum.ComLib_Edit][firstComIdx].comAray = [
          ...window[SourceEnum.ComLib_Edit][lastComIndex].comAray,
        ];
        window[SourceEnum.ComLib_Edit].splice(lastComIndex, 1);
      }
      setTimeout(() => resolveSelfLibStyle(styles), 1500);
      resolve(window[SourceEnum.ComLib_Edit][firstComIdx]);
    }).catch(err => {
        reject(new Error('加载我的组件失败'))
    })
  })
}

interface NameAndVersion {
  namespace: string,
  version?: string
}

type ComboLibType = 'rt' | 'edit'

export const getComlibsByNamespaceAndVersion = (nameAndVersions: NameAndVersion[], comboLibType: ComboLibType = 'edit') => {
  const comboComlibURL = new ComboComlibURL()
  comboComlibURL.setComponents(nameAndVersions)
  return getMySelfLibComsFromUrl(comboLibType === 'edit' ? comboComlibURL.toEditUrl() : comboComlibURL.toRtUrl());
}


export function resolveSelfLibStyle(styles) {
  const childNodes = document.querySelector("[class^='canvasTrans']")?.childNodes;

  if (!childNodes) return;

  let shadowRoot;

  for (let i = 0; i < childNodes.length; i++) {
    // @ts-ignore
    if (childNodes[i]?.shadowRoot) {
      // @ts-ignore
      shadowRoot = childNodes[i]?.shadowRoot;
      break;
    }
  }

  // const shadowRoot = document.querySelector("[class^='canvasTrans']")?.firstChild?.shadowRoot;

  if (shadowRoot) {
    styles.forEach((node) => {
      node.setAttribute('lib-id', '_myself_');
      shadowRoot.appendChild(node);
    });
  }
}

let styleCount = 0


function createScript(src, index) {
  var script = document.createElement('script')
  script.setAttribute('src', src)
  script.setAttribute('index', index)
  return script
}
// 保存原始的 createElement 和 appendChild 方法
const originalCreateElement = document.createElement;

// 用于存储加载样式的 script 信息
const styleSources = [];

function checkIsMyRequireLibs(libs, stackStr) {
  return libs.some(item => stackStr.includes(item))
}

export function myRequire(arr, onError): Promise<{ styles: any }> {
  return new Promise((resolve, reject) => {
    if (!(arr instanceof Array)) {
      console.error('arr is not a Array')
      return false
    }

    var REQ_TOTAL = 0,
      EXP_ARR = [],
      REQLEN = arr.length

    const styles: any = []
    // const rnStyles: any = []

    const _headAppendChild = document.head.appendChild

    document.head.appendChild = function(ele) {
      if (ele instanceof HTMLStyleElement) {
          // 在添加样式时，可以记录或者处理相关逻辑
          // 捕获当前调用栈
          const stack = new Error().stack || '';
          const scriptSource =  stack.split('\n')[2]; // 获取调用栈中的第三行
          if (checkIsMyRequireLibs(arr, scriptSource)) {
            ele.id = 'mybricks_' + styleCount
            // debugger
            styleCount++
            styles.push(ele);
            // console.log(`Style added from: ${scriptSource}`,);
          }
      }
      return _headAppendChild.call(this, ele);
    };


    arr.forEach(function (req_item, index, arr) {
      const script = createScript(req_item, index)
      document.body.appendChild(script)
        // getScriptStyle(req_item);
        ; (function (script) {
          script.onerror = (err) => {
            REQ_TOTAL++
            onError(err)
            if (REQ_TOTAL == REQLEN) {
              document.head.appendChild = _headAppendChild
              // document.head.insertBefore = _headInsertBefore
            }
          }
          script.onload = function () {
            REQ_TOTAL++
            const script_index = script.getAttribute('index')
            EXP_ARR[script_index] = this

            if (REQ_TOTAL == REQLEN) {
              // resolve(EXP_ARR)
              resolve({ styles })
              removeStylesBySubstring('mybricks_')
              // callback && callback.apply(this, EXP_ARR);
              document.head.appendChild = _headAppendChild
              // document.head.insertBefore = _headInsertBefore
            }
          }
        })(script)
    })
  })
}


function removeStylesBySubstring(substring) {
  // 获取所有的 style 标签
  const styleTags = document.querySelectorAll('style');

  // 遍历每个 style 标签
  styleTags.forEach(styleTag => {
    // 判断 id 是否包含指定的子字符串
    if (styleTag.id.includes(substring)) {
      // 如果匹配，则移除该 style 标签
      styleTag.remove();
    }
  });
}
