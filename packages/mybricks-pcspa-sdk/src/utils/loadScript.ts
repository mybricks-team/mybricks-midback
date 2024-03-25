export function loadScript({ url, name }: { url: string; name: string }) {
  return new Promise((resolve, reject) => {
    if (window[name]) {
      resolve(null)
      return
    }
    const script = document.createElement('script')
    script.src = url
    script.crossOrigin = 'anonymous'
    script.onload = (e) => {
      resolve(null)
    }
    script.onerror = reject
    document.body.appendChild(script)
  })
}

const Assets = [
  {
    url: 'https://cdn.jsdelivr.net/npm/json-schema-to-typescript-for-browser@11.0.3/dist/bundle.min.js',
    name: 'jstt'
  },
  {
    url: 'https://unpkg.com/@babel/standalone/babel.min.js',
    name: 'Babel'
  }
]

export const loadAssets = () => {
  return Promise.all(Assets.map((asset) => loadScript(asset)))
}
