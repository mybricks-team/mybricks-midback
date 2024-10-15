export async function fetchJSCode(
  url: string,
  cdnDTOptions?: any,
): Promise<string> {
  const res = await fetch(url)
  let js = await res.text()
  if (js.indexOf('//# sourceURL=') < 0) {
    js += '\n//# sourceURL=' + url
  }
  return js
}

export function loadCjs<T>(js: string, deps: Record<string, unknown> = {}): T {
  const exports = {} as T
  const module = { exports }
  const ctx = {
    require(name: string): unknown {
      return deps[name]
    },
    exports,
    module,
  }
  new Function(...Object.keys(ctx), js)(...Object.values(ctx))
  return module.exports
}

/**
 * 加载 js
 * @param jsURL js 文件 URL
 * @param deps 依赖项
 */
export async function loadJSPure<T>(
  jsURL: string,
  deps: any = {},
): Promise<T> {
  const js = await fetchJSCode(jsURL)
  return loadCjs(js, deps)
}
