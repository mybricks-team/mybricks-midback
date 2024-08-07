export function deepCopy(obj: any, cache: any = []) {
  const type = Object.prototype.toString.call(obj)
  if (obj === null || typeof obj !== 'object' || type.startsWith('[object HTML')) {
    return obj
  }

  const hit = cache.filter((i: any) => i.original === obj)[0]

  if (hit) {
    return hit.copy
  }

  const copy: any = Array.isArray(obj) ? [] : {}

  cache.push({
    original: obj,
    copy
  })

  Object.getOwnPropertyNames(obj).forEach(key => {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key)

    if (descriptor && typeof descriptor.get === 'function') {
      Object.defineProperty(copy, key, {
        get: descriptor.get,
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable
      });
    } else {
      copy[key] = deepCopy(obj[key], cache)
    }    
  })

  return copy
}