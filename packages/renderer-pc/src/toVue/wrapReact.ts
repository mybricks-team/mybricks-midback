import { createElement } from 'react';
import { renderToString } from 'react-dom/server'
import Renderer from '../core'

// props, config, json, comDefs, className, style
const getHtml = ({ className, style, json, comDefs, config, props }) => {
  const reactEle = createElement(Renderer,
    {
      className,
      style,
      json,
      comDefs,
      config,
      props,
    })
  try {
    // 包裹一层与applyPureReactInVue生成一致的root组件
    // const res = `<div __use_react_component_wrap style="all: unset;">${renderToString(reactEle)}</div>`
    const res = renderToString(reactEle)
    return res
  } catch (e) {
    console.error(`renderToString error`, e)
    return 'render error'
  }
}

export { getHtml }