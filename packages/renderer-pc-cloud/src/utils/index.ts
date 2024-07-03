const decode = (str: string) => {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    // if (process.env.NODE_ENV !== 'production') {
    //   console.warn(false, `Error decoding "${str}". Leaving it intact.`)
    // }
  }
  return str
}

export const parseQuery = (query: string) => {
  const res = {}
  query = query.trim().replace(/^(\?|#|&)/, '')
  if (!query) {
    return res
  }
  query.split('&').forEach((param) => {
    const parts = param.replace(/\+/g, ' ').split('=')
    const key = decode(parts.shift())
    const val = parts.length > 0 ? decode(parts.join('=')) : null
    if (res[key] === undefined) {
      res[key] = val
    } else if (Array.isArray(res[key])) {
      res[key].push(val)
    } else {
      res[key] = [res[key], val]
    }
  })
  return res
}