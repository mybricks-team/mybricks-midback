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

export const getMySelfLibComsFromUrl = (url) => {

  if (url?.split('components=')?.[1]?.length === 0) {
    window['__comlibs_edit_'].unshift({
      comAray: [],
      id: '_myself_',
      title: '我的组件',
      defined: true,
    });
    // 跳过空请求
    return Promise.resolve([])
  }

  return new Promise((resolve, reject) => {
    loadScript(url,).then(({ styles }) => {
      /** 添加之后会有多组件存储于__comlibs_edit_需要合并下 */
      const firstComIdx = window['__comlibs_edit_'].findIndex(
        (lib) => lib.id === MY_SELF_ID,
      );
      const lastComIndex = window['__comlibs_edit_'].findLastIndex(
        (lib) => lib.id === MY_SELF_ID,
      );
      if (firstComIdx !== lastComIndex) {
        window['__comlibs_edit_'][firstComIdx].comAray = [
          ...window['__comlibs_edit_'][lastComIndex].comAray,
        ];
        window['__comlibs_edit_'].splice(lastComIndex, 1);
      }
      setTimeout(() => resolveSelfLibStyle(styles), 1500);
      // console.log('加载', window['__comlibs_edit_'])
      resolve(window['__comlibs_edit_'][firstComIdx]);
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


export function myRequire(arr, onError): Promise<{ styles: any; rnStyles: any }> {
  return new Promise((resolve, reject) => {
    if (!(arr instanceof Array)) {
      console.error("arr is not a Array");
      return false;
    }

    let REQ_TOTAL = 0,
      EXP_ARR = [],
      REQLEN = arr.length;

    // const styles: any = [];
    const rnStyles: any = [];
    Promise.all(arr.map(req_item => loadScript(req_item))).then(allData => {
      const styles = allData.map(item => item.styles)
      console.log('allData', allData, styles)
      resolve(styles as any)
    })


    // arr.forEach(function (req_item, index, arr) {
    //   const { styles } = loadScript(req_item)
    // });
  });
}
