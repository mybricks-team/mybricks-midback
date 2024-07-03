interface Config {
  success: () => void
  failed: () => void
  // 是否强制下载
  forceLoad?: boolean
}

function hasScript(src: string) {
  const scripts = document.head.getElementsByTagName('script') || []
  return [].some.call(
    scripts,
    script => script.src.replace(/https?:/, "") === src,
  )
}

function queue() {
  const obj = {}
  return {
    push(key: string, cb) {
      obj[key] = obj[key] || []
      obj[key].push(cb)
    },
    pop(key: string) {
      ; (obj[key] || []).forEach(cb => cb())
      obj[key] = []
      obj[key].load = true
    },
    has(key: string) {
      return obj[key]?.load
    },
  }
}

const list = queue()

function loadScript(
  originSrc: string,
  { success, failed, forceLoad }: Config,
) {
  const src = forceLoad ? `${originSrc}?${Number(new Date())}` : originSrc

  list.push(src, success)

  if (hasScript(src)) {
    // 已经加载完成的组件，直接调用success回调
    if (list.has(src)) {
      success()
    }
    return
  }
  const script: any = document.createElement('script')

  script.type = 'text/javascript'
  script.src = src
  script.async = true
  script.onload = (val) => {
    console.log('onload', window['__MY_BRICKS_CLOUD__'])
    list.pop(src)
  }
  script.onerror = () => failed()
  document.head.appendChild(script)
}

export default loadScript