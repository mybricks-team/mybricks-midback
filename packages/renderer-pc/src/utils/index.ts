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


export const compareVersionLatest = (v1: string, v2: string): number => {
  const [v1Main, v1PreRelease] = v1.split('-')
  const [v2Main, v2PreRelease] = v2.split('-')

  // 比较版本主体的大小
  const v1List = v1Main.split('.')
  const v2List = v2Main.split('.')
  const len1 = v1List.length
  const len2 = v2List.length
  const minLen = Math.min(len1, len2)
  let curIdx = 0
  for (curIdx; curIdx < minLen; curIdx += 1) {
    const v1CurNum = parseInt(v1List[curIdx])
    const v2CurNum = parseInt(v2List[curIdx])
    if (v1CurNum > v2CurNum) {
      return 1
    } else if (v1CurNum < v2CurNum) {
      return -1
    }
  }
  if (len1 > len2) {
    for (let lastIdx = curIdx; lastIdx < len1; lastIdx++) {
      if (parseInt(v1List[lastIdx]) != 0) {
        return 1
      }
    }
    return 0
  } else if (len1 < len2) {
    for (let lastIdx = curIdx; lastIdx < len2; lastIdx += 1) {
      if (parseInt(v2List[lastIdx]) != 0) {
        return -1
      }
    }
    return 0
  }

  // 如果存在先行版本，还需要比较先行版本的大小
  if (v1PreRelease && !v2PreRelease) {
    return 1
  } else if (!v1PreRelease && v2PreRelease) {
    return -1
  } else if (v1PreRelease && v2PreRelease) {
    const [gama1, time1] = v1PreRelease.split('.')
    const [gama2, time2] = v2PreRelease.split('.')
    if (gama1 > gama2) return 1
    if (gama2 > gama1) return -1
    if (parseInt(time1) > parseInt(time2)) return 1
    if (parseInt(time2) > parseInt(time1)) return -1
  }
  return 0
}