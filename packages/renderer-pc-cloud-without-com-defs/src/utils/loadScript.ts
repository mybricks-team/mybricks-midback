interface Config {
  success: () => void
  failed: (msg: string) => void
  // 是否强制下载
  forceLoad?: boolean
}

function hasScript(src: string) {
  const scripts = document.head.getElementsByTagName('script') || []
  return [].some.call(
    scripts,
    script => script.src.replace(/https?:/, "") === src || script.src === src,
  )
}

function queue() {
  const obj = {}
  return {
    push(key: string, cbs) {
      obj[key] = obj[key] || []
      obj[key].push(cbs)
    },
    pop(key: string, stats: 'success' | 'failed', msg?: string) {
      ; (obj[key] || []).forEach(cbs => cbs?.[stats](msg))
      obj[key] = []
      obj[key].load = stats === 'success'
      if (msg) {
        obj[key].msg = msg
      }
    },
    has(key: string) {
      return obj[key]?.load
    },
    getMsg(key) {
      return obj[key].msg
    }
  }
}

const list = queue()

function loadScript(
  originSrc: string,
  { success, failed, forceLoad }: Config,
) {
  const src = forceLoad ? `${originSrc}?${Number(new Date())}` : originSrc

  list.push(src, { success, failed })

  if (hasScript(src)) {
    // 已经加载完成的组件，直接调用success回调
    if (list.has(src)) {
      success()
    } else if (list.getMsg(src)) {
      failed(list.getMsg(src))
    }
    return
  }
  const script: any = document.createElement('script')

  script.type = 'text/javascript'
  script.src = src
  script.async = true
  script.onload = (val) => {
    // console.log('onload', window['__MY_BRICKS_CLOUD__'])
    list.pop(src, 'success')
  }
  script.onerror = (e) => {
    list.pop(src, 'failed', `组件加载失败，请检查网络或组件地址！`)
  }

  document.head.appendChild(script)
}

export default loadScript