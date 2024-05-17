export const decode = (str: string) => {
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

// 字符串集合包含了大小写字母和数字
const UUID_CHARTS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** 从0-9a-zA-Z挑选字符随机生成id */
export function uuid(length: number = 2): string {
  let id = '';
  // 随机选取字符长度
  for (let i = 0; i < length; i++) {
    id += UUID_CHARTS.charAt(Math.floor(Math.random() * UUID_CHARTS.length));
  }
  return id;
}
